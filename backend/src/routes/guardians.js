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
        'Mother' as relationship
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
        g.relationship_to_orphan as relationship
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
        contact_phone: mother.phone_1,
        current_occupation: mother.occupation,
        relationship_to_child: 'Mother'
      };

      orphans = await query('SELECT * FROM orphans WHERE mother_id = ? AND mother_is_custodian = 1', [req.params.id]);

    } else {
      // Default to external guardian
      const [g] = await query('SELECT * FROM guardians WHERE id = :id', { id: req.params.id });
      if (!g) return res.status(404).json({ message: 'Guardian not found' });
      guardian = g;

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
    let allowed = [];

    if (type === 'mother') {
      table = 'mothers';
      // Map frontend fields (common interface) to database fields for mothers
      // Frontend sends: full_name, phone, current_occupation...
      // DB Mothers expects: full_name, phone_1, occupation...

      if (body.full_name) { updates.push('full_name = :full_name'); params.full_name = body.full_name; }
      if (body.phone) { updates.push('phone_1 = :phone'); params.phone = body.phone; }
      if (body.current_occupation) { updates.push('occupation = :occupation'); params.occupation = body.current_occupation; }
      // Add other mother fields as needed

    } else {
      // Default Guardian
      allowed = [
        'full_name', 'date_of_birth', 'national_id', 'relationship_to_child',
        'contact_phone', 'address', 'occupation', 'monthly_income', 'health_status', 'notes',
        // Allow mapped fields from frontend if they differ
        'phone', 'current_occupation'
      ];

      // Map frontend common names to DB columns if necessary, or assume they match 
      // In existing code, they seem to match partly. Let's ensure robust mapping.
      if (body.full_name) { updates.push('full_name = :full_name'); params.full_name = body.full_name; }
      if (body.phone) { updates.push('contact_phone = :phone'); params.phone = body.phone; } /* DB=contact_phone */
      if (body.current_occupation) { updates.push('occupation = :occupation'); params.occupation = body.current_occupation; } /* DB=occupation */
      if (body.monthly_income) { updates.push('monthly_income = :monthly_income'); params.monthly_income = body.monthly_income; }
      // Add others...
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