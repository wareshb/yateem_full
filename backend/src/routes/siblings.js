import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/orphans/:id/siblings - Add sibling to orphan
router.post('/', authenticate, async (req, res, next) => {
    try {
        const uid = uuidv4();
        const {
            orphan_id, full_name, date_of_birth, gender,
            grade_level, school_name, academic_rating,
            memorizes_quran, quran_center_name, quran_parts_memorized, not_memorizing_reason,
            father_id, mother_id, guardian_id
        } = req.body;

        const result = await query(`
      INSERT INTO orphan_siblings (
        uid, orphan_id, full_name, date_of_birth, gender,
        grade_level, school_name, academic_rating,
        memorizes_quran, quran_center_name, quran_parts_memorized, not_memorizing_reason,
        father_id, mother_id, guardian_id
      )
      VALUES (
        :uid, :orphan_id, :full_name, :date_of_birth, :gender,
        :grade_level, :school_name, :academic_rating,
        :memorizes_quran, :quran_center_name, :quran_parts_memorized, :not_memorizing_reason,
        :father_id, :mother_id, :guardian_id
      )
    `, {
            uid, orphan_id, full_name, date_of_birth, gender,
            grade_level, school_name, academic_rating,
            memorizes_quran, quran_center_name, quran_parts_memorized, not_memorizing_reason,
            father_id, mother_id, guardian_id
        });

        res.status(201).json({ id: result.insertId, uid, message: 'تم إضافة الأخ/الأخت بنجاح' });
    } catch (err) {
        next(err);
    }
});

// GET /api/orphans/:orphanId/siblings - Get siblings of specific orphan
router.get('/orphan/:orphanId', async (req, res, next) => {
    try {
        const siblings = await query(`
      SELECT s.*, 
        f.full_name as father_name,
        m.full_name as mother_name
      FROM orphan_siblings s
      LEFT JOIN fathers f ON f.id = s.father_id
      LEFT JOIN mothers m ON m.id = s.mother_id
      WHERE s.orphan_id = :orphanId
      ORDER BY s.date_of_birth
    `, { orphanId: req.params.orphanId });

        res.json(siblings);
    } catch (err) {
        next(err);
    }
});

// GET /api/siblings/:id - Get specific sibling
router.get('/:id', async (req, res, next) => {
    try {
        const [sibling] = await query('SELECT * FROM orphan_siblings WHERE id = :id', { id: req.params.id });
        if (!sibling) return res.status(404).json({ message: 'الأخ/الأخت غير موجود' });
        res.json(sibling);
    } catch (err) {
        next(err);
    }
});

// PATCH /api/siblings/:id - Update sibling
router.patch('/:id', authenticate, async (req, res, next) => {
    try {
        const fields = req.body;
        const allowed = [
            'full_name', 'date_of_birth', 'gender',
            'grade_level', 'school_name', 'academic_rating',
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

        const sql = `UPDATE orphan_siblings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
        await query(sql, params);

        res.json({ message: 'تم التحديث بنجاح' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/siblings/:id - Delete sibling
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        await query('DELETE FROM orphan_siblings WHERE id = :id', { id: req.params.id });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (err) {
        next(err);
    }
});

export default router;
