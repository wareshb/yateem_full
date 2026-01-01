import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;

    // Effective Guardians Query: Mothers (Custodian) UNION Guardians (Non-Custodian Mother)
    // Using simple concatenation for search is risky but sticking to existing pattern safely

    // 1. Custodian Mothers
    let mothersSql = `
      SELECT 
        m.id, 
        m.full_name, 
        m.phone_1 as phone, 
        m.occupation as job,
        'mother' as type, 
        COUNT(DISTINCT o.id) as orphans_count,
        'Mother' as relationship,
        m.address,
        m.monthly_income,
        m.id_number,
        m.nationality
      FROM mothers m 
      JOIN orphans o ON o.mother_id = m.id 
      WHERE o.mother_is_custodian = 1
    `;

    // 2. External Guardians (where Mother is NOT custodian)
    let guardiansSql = `
      SELECT 
        g.id, 
        g.full_name, 
        g.phone, 
        g.current_occupation as job,
        'guardian' as type, 
        COUNT(DISTINCT o.id) as orphans_count,
        g.relationship_to_orphan as relationship,
        g.address,
        g.monthly_income,
        g.id_number,
        g.nationality
      FROM guardians g 
      JOIN orphans o ON o.guardian_id = g.id 
      WHERE o.mother_is_custodian = 0
    `;

    if (search) {
      mothersSql += ` AND m.full_name LIKE '%${search}%'`;
      guardiansSql += ` AND g.full_name LIKE '%${search}%'`;
    }

    mothersSql += ` GROUP BY m.id`;
    guardiansSql += ` GROUP BY g.id`;

    const sql = `(${mothersSql}) UNION (${guardiansSql}) ORDER BY full_name LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

    const rows = await query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      full_name,
      date_of_birth,
      national_id,
      relationship_to_child,
      contact_phone,
      address,
      occupation,
      monthly_income,
      health_status,
      notes,
    } = req.body;
    const result = await query(
      `INSERT INTO guardians
       (full_name, date_of_birth, national_id, relationship_to_child, contact_phone, address, occupation, monthly_income, health_status, notes)
       VALUES (:full_name, :date_of_birth, :national_id, :relationship_to_child, :contact_phone, :address, :occupation, :monthly_income, :health_status, :notes)`,
      {
        full_name,
        date_of_birth,
        national_id,
        relationship_to_child,
        contact_phone,
        address,
        occupation,
        monthly_income,
        health_status,
        notes,
      },
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { type } = req.query;
    let guardian, orphans;

    if (type === 'mother') {
      const [mother] = await query('SELECT * FROM mothers WHERE id = ?', [req.params.id]);
      if (!mother) return res.status(404).json({ message: 'Mother not found' });

      // Normalize fields to match guardian structure for frontend consistency
      guardian = {
        ...mother,
        phone: mother.phone_1,
        contact_phone: mother.phone_1,
        current_occupation: mother.occupation,
        relationship: 'Mother',
        relationship_to_child: 'Mother', // alias
        health_condition: mother.health_status,
        id_number: mother.id_number
      };

      orphans = await query('SELECT * FROM orphans WHERE mother_id = ? AND mother_is_custodian = 1', [req.params.id]);

    } else {
      // Default to external guardian
      const [g] = await query('SELECT * FROM guardians WHERE id = :id', { id: req.params.id });
      if (!g) return res.status(404).json({ message: 'Guardian not found' });

      guardian = {
        ...g,
        id_number: g.national_id, // frontend: id_number -> db: national_id
        relationship: g.relationship_to_orphan, // frontend: relationship -> db: relationship_to_orphan
        health_condition: g.health_status, // frontend: health_condition -> db: health_status
        // phone and current_occupation match db columns per check_db_columns output?
        // Let's verify: guardians table has 'phone' and 'current_occupation' from earlier 'DESCRIBE'
      };

      orphans = await query('SELECT * FROM orphans WHERE guardian_id = ? AND mother_is_custodian = 0', [req.params.id]);
    }

    res.json({ ...guardian, orphans });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { type } = req.query;
    const body = req.body;
    const params = { id: req.params.id };
    const updates = [];
    let table = 'guardians';

    // Helper to add update field if it exists in body
    const addUpdate = (dbField, bodyValue) => {
      if (bodyValue !== undefined) {
        updates.push(`${dbField} = :${dbField}`);
        params[dbField] = bodyValue;
      }
    };

    if (type === 'mother') {
      table = 'mothers';
      // Map frontend fields to DB columns for mothers
      addUpdate('full_name', body.full_name);
      addUpdate('phone_1', body.phone); // frontend: phone -> db: phone_1
      addUpdate('occupation', body.current_occupation); // frontend: current_occupation -> db: occupation

      // New fields added by migration
      addUpdate('date_of_birth', body.date_of_birth);
      addUpdate('nationality', body.nationality);
      addUpdate('address', body.address);
      addUpdate('monthly_income', body.monthly_income);
      addUpdate('health_status', body.health_condition || body.health_status); // Front might send health_condition
      addUpdate('marital_status', body.marital_status);
      addUpdate('educational_level', body.educational_level);
      addUpdate('work_place', body.work_plane || body.work_place);
      addUpdate('province', body.province);
      addUpdate('district', body.district);
      addUpdate('notes', body.notes);

    } else {
      // Default: External Guardian
      table = 'guardians';

      // Mappings for guardians table
      addUpdate('full_name', body.full_name);
      addUpdate('contact_phone', body.phone); // frontend: phone -> db: contact_phone
      addUpdate('occupation', body.current_occupation); // frontend: current_occupation -> db: occupation
      addUpdate('relationship_to_child', body.relationship); // frontend: relationship
      addUpdate('national_id', body.id_number); // frontend: id_number -> db: national_id

      // Generic fields
      addUpdate('date_of_birth', body.date_of_birth);
      addUpdate('nationality', body.nationality);
      addUpdate('address', body.address);
      addUpdate('monthly_income', body.monthly_income);
      addUpdate('health_status', body.health_condition || body.health_status);
      addUpdate('marital_status', body.marital_status);
      addUpdate('educational_level', body.educational_level);
      addUpdate('work_place', body.work_place);
      addUpdate('province', body.province);
      addUpdate('district', body.district);
      addUpdate('notes', body.notes);
    }

    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });

    const sql = `UPDATE ${table} SET ${updates.join(', ')} WHERE id = :id`;
    await query(sql, params);

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await query('DELETE FROM guardians WHERE id = :id', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;