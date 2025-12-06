import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getConnection } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/orphans - List orphans with filters
router.get('/', async (req, res, next) => {
  try {
    const { search, status, limit = 50, page = 1 } = req.query;
    const params = { limit: Number(limit), offset: (Number(page) - 1) * Number(limit) };

    let sql = `
      SELECT o.*, 
        f.full_name as father_name,
        m.full_name as mother_name, m.phone_1 as mother_phone,
        g.full_name as guardian_name,
        r.province, r.district,
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
    let father_id = null;
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
    let mother_id = null;
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
    let guardian_id = null;
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
    let residence_id = null;
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
      health_condition || 'سليم', illness_type, illness_notes,
      is_studying !== false, grade_level, school_name, school_type, academic_rating, not_studying_reason,
      memorizes_quran || false, quran_center_name, quran_parts_memorized || 0, not_memorizing_reason,
      father_id, mother_id, guardian_id, mother_is_custodian !== false, residence_id
    ]);

    const new_orphan_id = orphanResult.insertId;

    // 6. Create siblings if provided
    if (Array.isArray(siblings) && siblings.length > 0) {
      for (const sibling of siblings) {
        const siblingUid = uuidv4();
        await conn.query(`
          INSERT INTO orphan_siblings (
            uid, orphan_id, full_name, date_of_birth, gender,
            grade_level, school_name, academic_rating,
            memorizes_quran, quran_center_name, quran_parts_memorized, not_memorizing_reason,
            father_id, mother_id, guardian_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          siblingUid, new_orphan_id, sibling.full_name, sibling.date_of_birth, sibling.gender,
          sibling.grade_level, sibling.school_name, sibling.academic_rating,
          sibling.memorizes_quran || false, sibling.quran_center_name, sibling.quran_parts_memorized || 0, sibling.not_memorizing_reason,
          father_id, mother_id, guardian_id
        ]);
      }
    }

    await conn.commit();

    res.status(201).json({
      id: new_orphan_id,
      uid: orphanUid,
      message: 'تم إضافة اليتيم بنجاح',
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

    // Get siblings
    const siblings = await query(`
      SELECT * FROM orphan_siblings WHERE orphan_id = :id ORDER BY date_of_birth
    `, { id: req.params.id });

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

    const updates = [];
    const params = { id: req.params.id };

    allowed.forEach((field) => {
      if (fields[field] !== undefined) {
        updates.push(`${field} = :${field}`);
        params[field] = fields[field];
      }
    });

    if (!updates.length) return res.status(400).json({ message: 'لا توجد حقول للتحديث' });

    const sql = `UPDATE orphans SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
    await query(sql, params);

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

export default router;
