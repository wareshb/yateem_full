import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/mothers - Get all mothers
router.get('/', async (req, res, next) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT * FROM mothers WHERE 1=1';
        const params = {};

        if (search) {
            sql += ' AND (full_name LIKE :search OR phone_1 LIKE :search OR phone_2 LIKE :search)';
            params.search = `%${search}%`;
        }

        sql += ' ORDER BY full_name';
        const mothers = await query(sql, params);
        res.json(mothers);
    } catch (err) {
        next(err);
    }
});

// POST /api/mothers - Create new mother
router.post('/', authenticate, async (req, res, next) => {
    try {
        const uid = uuidv4();
        const {
            full_name, id_type, id_number, marital_status, occupation,
            can_read_write, phone_1, phone_2, is_custodian, number_of_orphans_in_custody
        } = req.body;

        const result = await query(`
      INSERT INTO mothers (uid, full_name, id_type, id_number, marital_status, occupation,
        can_read_write, phone_1, phone_2, is_custodian, number_of_orphans_in_custody)
      VALUES (:uid, :full_name, :id_type, :id_number, :marital_status, :occupation,
        :can_read_write, :phone_1, :phone_2, :is_custodian, :number_of_orphans_in_custody)
    `, {
            uid, full_name, id_type, id_number, marital_status, occupation,
            can_read_write, phone_1, phone_2, is_custodian, number_of_orphans_in_custody
        });

        res.status(201).json({ id: result.insertId, uid, message: 'تم إضافة الأم بنجاح' });
    } catch (err) {
        next(err);
    }
});

// GET /api/mothers/:id - Get mother details
router.get('/:id', async (req, res, next) => {
    try {
        const [mother] = await query('SELECT * FROM mothers WHERE id = :id', { id: req.params.id });
        if (!mother) return res.status(404).json({ message: 'الأم غير موجودة' });
        res.json(mother);
    } catch (err) {
        next(err);
    }
});

// GET /api/mothers/:id/orphans - Get orphans of a specific mother
router.get('/:id/orphans', async (req, res, next) => {
    try {
        const orphans = await query(`
      SELECT o.*, r.province, r.district
      FROM orphans o
      LEFT JOIN residence_info r ON r.id = o.residence_id
      WHERE o.mother_id = :id
      ORDER BY o.date_of_birth
    `, { id: req.params.id });

        res.json(orphans);
    } catch (err) {
        next(err);
    }
});

// PATCH /api/mothers/:id - Update mother
router.patch('/:id', authenticate, async (req, res, next) => {
    try {
        const fields = req.body;
        const allowed = [
            'full_name', 'id_type', 'id_number', 'marital_status', 'occupation',
            'can_read_write', 'phone_1', 'phone_2', 'is_custodian', 'number_of_orphans_in_custody'
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

        const sql = `UPDATE mothers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
        await query(sql, params);

        res.json({ message: 'تم التحديث بنجاح' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/mothers/:id - Delete mother (if no orphans linked)
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        // Check if mother has orphans
        const [orphanCount] = await query(
            'SELECT COUNT(*) as count FROM orphans WHERE mother_id = :id',
            { id: req.params.id }
        );

        if (orphanCount.count > 0) {
            return res.status(400).json({ message: 'لا يمكن حذف الأم لوجود أيتام مرتبطين بها' });
        }

        await query('DELETE FROM mothers WHERE id = :id', { id: req.params.id });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (err) {
        next(err);
    }
});

export default router;
