import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/fathers - Create new father
router.post('/', authenticate, async (req, res, next) => {
    try {
        const uid = uuidv4();
        const {
            full_name, date_of_birth, date_of_death, cause_of_death,
            death_certificate_type, death_certificate_number, occupation_before_death
        } = req.body;

        const result = await query(`
      INSERT INTO fathers (uid, full_name, date_of_birth, date_of_death, cause_of_death,
        death_certificate_type, death_certificate_number, occupation_before_death)
      VALUES (:uid, :full_name, :date_of_birth, :date_of_death, :cause_of_death,
        :death_certificate_type, :death_certificate_number, :occupation_before_death)
    `, {
            uid, full_name, date_of_birth, date_of_death, cause_of_death,
            death_certificate_type, death_certificate_number, occupation_before_death
        });

        res.status(201).json({ id: result.insertId, uid, message: 'تم إضافة بيانات الأب بنجاح' });
    } catch (err) {
        next(err);
    }
});

// GET /api/fathers/:id - Get father details
router.get('/:id', async (req, res, next) => {
    try {
        const [father] = await query('SELECT * FROM fathers WHERE id = :id', { id: req.params.id });
        if (!father) return res.status(404).json({ message: 'بيانات الأب غير موجودة' });
        res.json(father);
    } catch (err) {
        next(err);
    }
});

// PATCH /api/fathers/:id - Update father
router.patch('/:id', authenticate, async (req, res, next) => {
    try {
        const fields = req.body;
        const allowed = [
            'full_name', 'date_of_birth', 'date_of_death', 'cause_of_death',
            'death_certificate_type', 'death_certificate_number', 'occupation_before_death'
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

        const sql = `UPDATE fathers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
        await query(sql, params);

        res.json({ message: 'تم التحديث بنجاح' });
    } catch (err) {
        next(err);
    }
});

export default router;
