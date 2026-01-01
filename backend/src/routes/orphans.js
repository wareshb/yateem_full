import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getConnection } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/orphans - List orphans with filters

// GET /api/orphans/next-id - Get next sequential orphan ID
router.get('/next-id', async (req, res, next) => {
  try {
    const [result] = await query(`
      SELECT orphan_id FROM orphans 
      WHERE orphan_id LIKE 'PHA-%' 
      ORDER BY LENGTH(orphan_id) DESC, orphan_id DESC 
      LIMIT 1
    `);

    let nextId = 'PHA-0001';
    if (result) {
      const currentIdStr = result.orphan_id;
      const currentNum = parseInt(currentIdStr.replace('PHA-', ''), 10);
      if (!isNaN(currentNum)) {
        nextId = `PHA-${String(currentNum + 1).padStart(4, '0')}`;
      }
    }
    res.json({ next_id: nextId });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { search, status, limit = 50, page = 1 } = req.query;
    const params = { limit: Number(limit), offset: (Number(page) - 1) * Number(limit) };

    let sql = `
      SELECT o.*, 
        f.full_name as father_name, f.date_of_birth as father_dob, f.date_of_death as father_date_of_death, f.cause_of_death as father_cause_of_death, f.occupation_before_death as father_occupation,
        m.full_name as mother_name, m.phone_1 as mother_phone, m.phone_2 as mother_phone_2, m.marital_status as mother_marital_status, m.occupation as mother_occupation, m.is_custodian as mother_is_custodian_flag,
        g.full_name as guardian_name, g.phone as guardian_phone, g.relationship_to_orphan, g.current_occupation as guardian_occupation,
        r.country as residence_country, r.province as residence_province, r.district as residence_district, r.neighborhood_or_street, r.residence_condition,
        so.name as sponsor_name
      FROM orphans o
      LEFT JOIN fathers f ON f.id = o.father_id
      LEFT JOIN mothers m ON m.id = o.mother_id
      LEFT JOIN guardians g ON g.id = o.guardian_id
      LEFT JOIN residence_info r ON r.id = o.residence_id
      LEFT JOIN sponsorships s ON s.orphan_id = o.id AND s.status = 'active'
      LEFT JOIN sponsor_organizations so ON so.id = s.sponsor_organization_id
      WHERE 1=1
    `;

    if (search) {
      sql += ' AND (o.full_name LIKE :search OR o.orphan_id LIKE :search)';
      params.search = `%${search}%`;
    }

    sql += ' ORDER BY o.created_at DESC LIMIT :limit OFFSET :offset';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/orphans - Create new orphan with full data
router.post('/', authenticate, async (req, res, next) => {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const orphanUid = uuidv4();
    const {
      // Orphan basic data
      orphan_id, full_name, date_of_birth, gender, nationality, id_type, id_number,

      // Birth info
      birth_country, birth_province, birth_district, birth_neighborhood,

      // Origin info
      origin_country, origin_province, origin_district,

      // Siblings
      male_siblings_count, female_siblings_count, lives_with_siblings,

      // Health
      health_condition, illness_type, illness_notes,

      // Education
      is_studying, grade_level, school_name, school_type, academic_rating, not_studying_reason,

      // Quran
      memorizes_quran, quran_center_name, quran_parts_memorized, not_memorizing_reason,

      // Relations - Father
      father_data,  // { full_name, date_of_birth, date_of_death, cause_of_death, death_certificate_type, death_certificate_number, occupation_before_death }

      // Relations - Mother
      mother_data,  // { full_name, id_type, id_number, marital_status, occupation, can_read_write, phone_1, phone_2, is_custodian, number_of_orphans_in_custody }

      // Relations - Guardian (if mother is not custodian)
      mother_is_custodian,
      guardian_data, // { full_name, relationship_to_orphan, id_type, id_number, phone, current_occupation }

      // Residence
      residence_data, // { country, province, district, neighborhood_or_street, residence_condition }

      // Siblings array
      siblings // [{ full_name, date_of_birth, gender, grade_level, school_name, academic_rating, memorizes_quran, quran_center_name, quran_parts_memorized, not_memorizing_reason }]

    } = req.body;

    // 1. Create or get father
    let father_id = req.body.father_id || null;
    if (father_data && father_data.full_name) {
      const fatherUid = uuidv4();
      const [fatherResult] = await conn.query(`
        INSERT INTO fathers (uid, full_name, date_of_birth, date_of_death, cause_of_death, death_certificate_type, death_certificate_number, occupation_before_death)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        fatherUid,
        father_data.full_name,
        father_data.date_of_birth || null,
        father_data.date_of_death || null,
        father_data.cause_of_death || null,
        father_data.death_certificate_type || 'مدنية',
        father_data.death_certificate_number || null,
        father_data.occupation_before_death || null
      ]);
      father_id = fatherResult.insertId;
    }

    // 2. Create or get mother
    let mother_id = req.body.mother_id || null;
    if (mother_data && mother_data.full_name) {
      const motherUid = uuidv4();
      const [motherResult] = await conn.query(`
        INSERT INTO mothers (uid, full_name, id_type, id_number, marital_status, occupation, can_read_write, phone_1, phone_2, is_custodian, number_of_orphans_in_custody)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        motherUid,
        mother_data.full_name,
        mother_data.id_type || null,
        mother_data.id_number || null,
        mother_data.marital_status || 'أرملة',
        mother_data.occupation || null,
        mother_data.can_read_write || false,
        mother_data.phone_1 || null,
        mother_data.phone_2 || null,
        mother_is_custodian !== false,
        mother_data.number_of_orphans_in_custody || 0
      ]);
      mother_id = motherResult.insertId;
    }

    // 3. Create guardian if needed
    let guardian_id = req.body.guardian_id || null;
    if (!mother_is_custodian && guardian_data && guardian_data.full_name) {
      const guardianUid = uuidv4();
      const [guardianResult] = await conn.query(`
        INSERT INTO guardians (uid, full_name, relationship_to_orphan, id_type, id_number, phone, current_occupation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        guardianUid,
        guardian_data.full_name,
        guardian_data.relationship_to_orphan || null,
        guardian_data.id_type || null,
        guardian_data.id_number || null,
        guardian_data.phone || null,
        guardian_data.current_occupation || null
      ]);
      guardian_id = guardianResult.insertId;
    }

    // 4. Create residence info
    let residence_id = req.body.residence_id || null;
    if (residence_data) {
      const [residenceResult] = await conn.query(`
        INSERT INTO residence_info (country, province, district, neighborhood_or_street, residence_condition)
        VALUES (?, ?, ?, ?, ?)
      `, [
        residence_data.country || 'اليمن',
        residence_data.province || null,
        residence_data.district || null,
        residence_data.neighborhood_or_street || null,
        residence_data.residence_condition || 'متوسطة'
      ]);
      residence_id = residenceResult.insertId;
    }

    // 5. Create orphan
    const [orphanResult] = await conn.query(`
      INSERT INTO orphans (
        uid, orphan_id, full_name, date_of_birth, gender, nationality, id_type, id_number,
        birth_country, birth_province, birth_district, birth_neighborhood,
        origin_country, origin_province, origin_district,
        male_siblings_count, female_siblings_count, lives_with_siblings,
        health_condition, illness_type, illness_notes,
        is_studying, grade_level, school_name, school_type, academic_rating, not_studying_reason,
        memorizes_quran, quran_center_name, quran_parts_memorized, not_memorizing_reason,
        father_id, mother_id, guardian_id, mother_is_custodian, residence_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orphanUid, orphan_id, full_name, date_of_birth, gender, nationality, id_type, id_number,
      birth_country, birth_province, birth_district, birth_neighborhood,
      origin_country, origin_province, origin_district,
      male_siblings_count || 0, female_siblings_count || 0, lives_with_siblings !== false,
      health_condition || 'سليم', illness_type || null, illness_notes,
      is_studying !== false, grade_level, school_name, school_type, academic_rating || null, not_studying_reason,
      memorizes_quran || false, quran_center_name, quran_parts_memorized || 0, not_memorizing_reason,
      father_id, mother_id, guardian_id, mother_is_custodian !== false, residence_id
    ]);

    const new_orphan_id = orphanResult.insertId;

    // 6. Create siblings as NEW ORPHANS
    if (Array.isArray(siblings) && siblings.length > 0) {
      let currentIdStr = orphan_id; // e.g., 'PHA-0001'
      let currentNum = parseInt(currentIdStr.replace('PHA-', ''), 10);

      for (const sibling of siblings) {
        const siblingUid = uuidv4();

        // Calculate next ID
        let siblingOrphanId = null;
        if (!isNaN(currentNum)) {
          currentNum++;
          siblingOrphanId = `PHA-${String(currentNum).padStart(4, '0')}`;
        } else {
          // Fallback if ID format is weird
          siblingOrphanId = `${orphan_id}-${Math.floor(Math.random() * 1000)}`;
        }

        await conn.query(`
          INSERT INTO orphans (
            uid, orphan_id, full_name, date_of_birth, gender, nationality, id_type, id_number,
            birth_country, birth_province, birth_district, birth_neighborhood,
            origin_country, origin_province, origin_district,
            male_siblings_count, female_siblings_count, lives_with_siblings,
            health_condition, illness_type, illness_notes,
            is_studying, grade_level, school_name, school_type, academic_rating, not_studying_reason,
            memorizes_quran, quran_center_name, quran_parts_memorized, not_memorizing_reason,
            father_id, mother_id, guardian_id, mother_is_custodian, residence_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          siblingUid, siblingOrphanId, sibling.full_name, sibling.date_of_birth, sibling.gender,
          nationality, null, null, // id_type/number typically not provided for siblings
          birth_country, birth_province, birth_district, birth_neighborhood, // Shared
          origin_country, origin_province, origin_district, // Shared
          male_siblings_count || 0, female_siblings_count || 0, true, // lives_with_siblings
          'سليم', null, null, // Default health
          sibling.grade_level ? true : false, sibling.grade_level, sibling.school_name, 'حكومي', sibling.academic_rating || null, null,
          sibling.memorizes_quran || false, sibling.quran_center_name, sibling.quran_parts_memorized || 0, sibling.not_memorizing_reason,
          father_id, mother_id, guardian_id, mother_is_custodian !== false, residence_id
        ]);
      }
    }

    // [New Logic] Ensure Mother is Guardian if Custodian
    if (mother_id && (mother_is_custodian !== false)) {
      await ensureMotherIsGuardian(conn, mother_id);
    }

    await conn.commit();

    res.status(201).json({
      id: new_orphan_id,
      uid: orphanUid,
      message: `تم إضافة اليتيم و ${siblings?.length || 0} من الإخوة بنجاح`,
      siblings_added: siblings?.length || 0
    });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// GET /api/orphans/:id - Get orphan details with all relations
router.get('/:id', async (req, res, next) => {
  try {
    const [orphan] = await query(`
      SELECT o.*, 
        f.full_name as father_name, f.date_of_birth as father_dob, f.date_of_death, f.cause_of_death,
        f.death_certificate_type, f.death_certificate_number, f.occupation_before_death,
        m.full_name as mother_name, m.id_type as mother_id_type, m.id_number as mother_id_number,
        m.marital_status as mother_marital_status, m.occupation as mother_occupation,
        m.can_read_write as mother_can_read_write, m.phone_1 as mother_phone_1, m.phone_2 as mother_phone_2,
        m.is_custodian as mother_is_custodian_flag, m.number_of_orphans_in_custody as mother_orphans_count,
        g.full_name as guardian_name, g.relationship_to_orphan, g.id_type as guardian_id_type,
        g.id_number as guardian_id_number, g.phone as guardian_phone, g.current_occupation as guardian_occupation,
        r.country as residence_country, r.province as residence_province, r.district as residence_district,
        r.neighborhood_or_street, r.residence_condition
      FROM orphans o
      LEFT JOIN fathers f ON f.id = o.father_id
      LEFT JOIN mothers m ON m.id = o.mother_id
      LEFT JOIN guardians g ON g.id = o.guardian_id
      LEFT JOIN residence_info r ON r.id = o.residence_id
      WHERE o.id = :id
    `, { id: req.params.id });

    if (!orphan) return res.status(404).json({ message: 'اليتيم غير موجود' });

    // Get siblings (New Method: Sharing Father or Mother)
    let siblings = [];
    if (orphan.father_id || orphan.mother_id) {
      const fatherCondition = orphan.father_id ? 'father_id = :father_id' : '0';
      const motherCondition = orphan.mother_id ? 'mother_id = :mother_id' : '0';

      siblings = await query(`
            SELECT id, full_name, date_of_birth, gender, grade_level, school_name, academic_rating, orphan_id
            FROM orphans
            WHERE id != :id AND (${fatherCondition} OR ${motherCondition})
            ORDER BY date_of_birth
        `, {
        id: req.params.id,
        father_id: orphan.father_id,
        mother_id: orphan.mother_id
      });
    }

    // Get legacy siblings (Backward Compatibility)
    const legacySiblings = await query(`
      SELECT * FROM orphan_siblings WHERE orphan_id = :id ORDER BY date_of_birth
    `, { id: req.params.id });

    // Combine them (Legacy siblings usually don't have orphan_id from main table)
    siblings = [...siblings, ...legacySiblings];

    // Get sponsorships
    const sponsorships = await query(`
      SELECT s.*, so.name as sponsor_name, so.sponsorship_type
      FROM sponsorships s
      JOIN sponsor_organizations so ON so.id = s.sponsor_organization_id
      WHERE s.orphan_id = :id
      ORDER BY s.start_date DESC
    `, { id: req.params.id });

    // Get marketing records
    const marketing = await query(`
      SELECT m.*, mo.name as org_name
      FROM marketing_records m
      JOIN marketing_organizations mo ON mo.id = m.marketing_organization_id
      WHERE m.orphan_id = :id
      ORDER BY m.marketing_date DESC
    `, { id: req.params.id });

    // Get attachments
    const attachments = await query(`
      SELECT id, attachment_type, file_name, file_size, created_at
      FROM attachments
      WHERE orphan_id = :id
      ORDER BY attachment_type
    `, { id: req.params.id });

    res.json({
      ...orphan,
      siblings,
      sponsorships,
      marketing,
      attachments
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orphans/:id - Update orphan
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const fields = req.body;
    const allowed = [
      'orphan_id', 'full_name', 'date_of_birth', 'gender', 'nationality', 'id_type', 'id_number',
      'birth_country', 'birth_province', 'birth_district', 'birth_neighborhood',
      'origin_country', 'origin_province', 'origin_district',
      'male_siblings_count', 'female_siblings_count', 'lives_with_siblings',
      'health_condition', 'illness_type', 'illness_notes',
      'is_studying', 'grade_level', 'school_name', 'school_type', 'academic_rating', 'not_studying_reason',
      'memorizes_quran', 'quran_center_name', 'quran_parts_memorized', 'not_memorizing_reason'
    ];

    // 1. Update Orphan Data
    if (Object.keys(fields).some(k => allowed.includes(k))) {
      // Sanitize ENUM fields
      if (fields.illness_type === '') fields.illness_type = null;
      if (fields.academic_rating === '') fields.academic_rating = null;
      if (fields.school_type === '') fields.school_type = null;

      const updates = [];
      const params = { id: req.params.id };

      allowed.forEach((field) => {
        if (fields[field] !== undefined) {
          updates.push(`${field} = :${field}`);
          params[field] = fields[field];
        }
      });

      if (updates.length > 0) {
        await query(`UPDATE orphans SET ${updates.join(', ')} WHERE id = :id`, params);
      }
    }

    // Get current IDs
    const [currentOrphan] = await query('SELECT father_id, mother_id, guardian_id, residence_id FROM orphans WHERE id = ?', [req.params.id]);

    // 2. Update Father
    if (fields.father_data && currentOrphan.father_id) {
      const fKeys = ['full_name', 'date_of_birth', 'date_of_death', 'cause_of_death',
        'death_certificate_type', 'death_certificate_number', 'occupation_before_death'];
      const fUpdates = [];
      const fParams = { id: currentOrphan.father_id };

      fKeys.forEach(k => {
        if (fields.father_data[k] !== undefined) {
          fUpdates.push(`${k} = :${k}`);
          fParams[k] = fields.father_data[k];
        }
      });

      if (fUpdates.length > 0) {
        await query(`UPDATE fathers SET ${fUpdates.join(', ')} WHERE id = :id`, fParams);
      }
    }

    // 3. Update Mother
    if (fields.mother_data && currentOrphan.mother_id) {
      const mKeys = ['full_name', 'id_type', 'id_number', 'marital_status',
        'occupation', 'can_read_write', 'phone_1', 'phone_2'];
      const mUpdates = [];
      const mParams = { id: currentOrphan.mother_id };

      mKeys.forEach(k => {
        if (fields.mother_data[k] !== undefined) {
          mUpdates.push(`${k} = :${k}`);
          mParams[k] = fields.mother_data[k];
        }
      });

      if (fields.mother_is_custodian !== undefined) {
        mUpdates.push(`is_custodian = :is_custodian`);
        mParams.is_custodian = fields.mother_is_custodian;
      }

      if (mUpdates.length > 0) {
        await query(`UPDATE mothers SET ${mUpdates.join(', ')} WHERE id = :id`, mParams);
      }
    }

    // 4. Update Guardian
    if (fields.guardian_data && currentOrphan.guardian_id) {
      const gKeys = ['full_name', 'relationship_to_orphan', 'id_type', 'id_number', 'phone', 'current_occupation'];
      const gUpdates = [];
      const gParams = { id: currentOrphan.guardian_id };

      gKeys.forEach(k => {
        if (fields.guardian_data[k] !== undefined) {
          gUpdates.push(`${k} = :${k}`);
          gParams[k] = fields.guardian_data[k];
        }
      });

      if (gUpdates.length > 0) {
        await query(`UPDATE guardians SET ${gUpdates.join(', ')} WHERE id = :id`, gParams);
      }
    }

    // 5. Update Residence
    if (fields.residence_data && currentOrphan.residence_id) {
      const rKeys = ['country', 'province', 'district', 'neighborhood_or_street', 'residence_condition'];
      const rUpdates = [];
      const rParams = { id: currentOrphan.residence_id };

      rKeys.forEach(k => {
        if (fields.residence_data[k] !== undefined) {
          rUpdates.push(`${k} = :${k}`);
          rParams[k] = fields.residence_data[k];
        }
      });

      if (rUpdates.length > 0) {
        await query(`UPDATE residence_info SET ${rUpdates.join(', ')} WHERE id = :id`, rParams);
      }
    }

    if (fields.mother_is_custodian !== undefined) {
      await query('UPDATE orphans SET mother_is_custodian = ? WHERE id = ?', [fields.mother_is_custodian, req.params.id]);
    }

    // [New Logic] Check and Ensure Mother is Guardian
    // We need to fetch the latest state to be sure
    const [updatedOrphan] = await query('SELECT mother_id, mother_is_custodian FROM orphans WHERE id = ?', [req.params.id]);
    if (updatedOrphan && updatedOrphan.mother_id && updatedOrphan.mother_is_custodian) {
      // Create a temporary connection wrapper for the single-query style since we aren't in a transaction here (or modify logic to accept pool)
      // Actually helper uses .query(), so passing the pool (or 'query' wrapper) directly might fail if it expects connection object logic
      // My helper logic above uses `conn.query`. The `query` export is usually `pool.query` or snippet. 
      // Let's obtain a connection or just assume the global `query` works if we wrap it to look like conn? 
      // Actually `ensureMotherIsGuardian` uses `conn.query`. The default `query` export in ../db.js likely returns [rows] or just rows depending on driver.
      // Looking at line 3: `import { query, getConnection } from '../db.js';`
      // `query` usage: `const [result] = await query(...)` -> It returns [rows, fields] (mysql2 promise).
      // `conn.query` usage: `const [result] = await conn.query(...)` -> same.

      // So I can pass an object { query: query } as "conn" if I want to use the global pool, 
      // OR I can get a fresh connection. 
      // Getting a connection is safer.
      const conn = await getConnection();
      try {
        await ensureMotherIsGuardian(conn, updatedOrphan.mother_id);
      } finally {
        conn.release();
      }
    }

    res.json({ message: 'تم التحديث بنجاح' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orphans/:id - Delete orphan
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await query('DELETE FROM orphans WHERE id = :id', { id: req.params.id });
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    next(err);
  }
});

// Helper to sync Mother to Guardians
const ensureMotherIsGuardian = async (conn, motherId) => {
  if (!motherId) return;

  // 1. Get Mother Details
  const [mother] = await conn.query('SELECT * FROM mothers WHERE id = ?', [motherId]);
  if (!mother) return;

  // 2. Check if she already exists in guardians (by National ID or Name+Phone)
  let existing = null;
  if (mother.id_number) {
    [existing] = await conn.query('SELECT id FROM guardians WHERE national_id = ?', [mother.id_number]);
  } else if (mother.phone_1 && mother.full_name) {
    [existing] = await conn.query('SELECT id FROM guardians WHERE contact_phone = ? AND full_name = ?', [mother.phone_1, mother.full_name]);
  }

  if (existing) {
    // Optional: Update existing guardian? For now, we just ensure existence.
    return existing.id;
  }

  // 3. Create Guardian
  const guardianUid = uuidv4(); // We need uuid here, ensure it's imported or generate it
  // Note: uuidv4 is imported at the top of file

  // Map Mother fields to Guardian fields
  // Guardian columns: full_name, date_of_birth, national_id, relationship_to_child, contact_phone, address, occupation, monthly_income, health_status, notes
  const [res] = await conn.query(`
      INSERT INTO guardians (
        uid, full_name, date_of_birth, national_id, relationship_to_child, 
        contact_phone, address, occupation, monthly_income, health_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
    guardianUid,
    mother.full_name,
    mother.date_of_birth || null, // Assuming migration added this
    mother.id_number,
    'Mother',
    mother.phone_1,
    mother.address || null,
    mother.occupation,
    mother.monthly_income || null,
    mother.health_status || null,
    'Added automatically from Mother (Custodian)'
  ]);

  return res.insertId;
};

export default router;
