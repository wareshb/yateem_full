import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/sponsor-organizations - Get all sponsor organizations
router.get('/', async (req, res, next) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT * FROM sponsor_organizations WHERE 1=1';
        const params = {};

        if (search) {
            sql += ' AND (name LIKE :search OR email LIKE :search OR phone LIKE :search)';
            params.search = `%${search}%`;
        }

        sql += ' ORDER BY name';
        const orgs = await query(sql, params);
        res.json(orgs);
    } catch (err) {
        next(err);
    }
});

// POST /api/sponsor-organizations - Create sponsor organization
router.post('/', authenticate, async (req, res, next) => {
    try {
        const uid = uuidv4();
        const {
            name, email, phone, sponsorship_type, responsible_person, start_date, notes
        } = req.body;

        const result = await query(`
      INSERT INTO sponsor_organizations (uid, name, email, phone, sponsorship_type, responsible_person, start_date, notes)
      VALUES (:uid, :name, :email, :phone, :sponsorship_type, :responsible_person, :start_date, :notes)
    `, { uid, name, email, phone, sponsorship_type, responsible_person, start_date, notes });

        res.status(201).json({ id: result.insertId, uid, message: 'تم إضافة الجهة الكافلة بنجاح' });
    } catch (err) {
        next(err);
    }
});

// GET /api/sponsor-organizations/:id - Get sponsor organization details
router.get('/:id', async (req, res, next) => {
    try {
        const [org] = await query('SELECT * FROM sponsor_organizations WHERE id = :id', { id: req.params.id });
        if (!org) return res.status(404).json({ message: 'الجهة الكافلة غير موجودة' });
        res.json(org);
    } catch (err) {
        next(err);
    }
});

// POST /api/sponsor-organizations/:id/orphans - Link orphans to sponsor
router.post('/:id/orphans', authenticate, async (req, res, next) => {
    try {
        const { orphan_ids, start_date, notes } = req.body; // orphan_ids is array
        const sponsor_id = req.params.id;

        if (!Array.isArray(orphan_ids) || orphan_ids.length === 0) {
            return res.status(400).json({ message: 'يجب تحديد أيتام للكفالة' });
        }

        // Insert sponsorships
        for (const orphan_id of orphan_ids) {
            await query(`
        INSERT INTO sponsorships (sponsor_organization_id, orphan_id, start_date, status, notes)
        VALUES (:sponsor_id, :orphan_id, :start_date, 'active', :notes)
        ON DUPLICATE KEY UPDATE status = 'active', start_date = VALUES(start_date)
      `, { sponsor_id, orphan_id, start_date: start_date || new Date().toISOString().split('T')[0], notes });
        }

        res.json({ message: `تم ربط ${orphan_ids.length} يتيم/أيتام بالجهة الكافلة` });
    } catch (err) {
        next(err);
    }
});

// GET /api/sponsor-organizations/:id/orphans - Get sponsored orphans
router.get('/:id/orphans', async (req, res, next) => {
    try {
        const orphans = await query(`
      SELECT o.*, s.start_date, s.status as sponsorship_status, s.notes as sponsorship_notes,
        r.province, r.district
      FROM sponsorships s
      JOIN orphans o ON o.id = s.orphan_id
      LEFT JOIN residence_info r ON r.id = o.residence_id
      WHERE s.sponsor_organization_id = :id AND s.status = 'active'
      ORDER BY o.full_name
    `, { id: req.params.id });

        res.json(orphans);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/sponsor-organizations/:id/orphans/:orphanId - Remove orphan from sponsor
router.delete('/:id/orphans/:orphanId', authenticate, async (req, res, next) => {
    try {
        await query(`
      UPDATE sponsorships 
      SET status = 'ended', end_date = CURDATE() 
      WHERE sponsor_organization_id = :id AND orphan_id = :orphanId
    `, { id: req.params.id, orphanId: req.params.orphanId });

        res.json({ message: 'تم إلغاء الكفالة' });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/sponsor-organizations/:id - Update sponsor organization
router.patch('/:id', authenticate, async (req, res, next) => {
    try {
        const fields = req.body;
        const allowed = ['name', 'email', 'phone', 'sponsorship_type', 'responsible_person', 'start_date', 'notes'];

        const updates = [];
        const params = { id: req.params.id };

        allowed.forEach((field) => {
            if (fields[field] !== undefined) {
                updates.push(`${field} = :${field}`);
                params[field] = fields[field];
            }
        });

        if (!updates.length) return res.status(400).json({ message: 'لا توجد حقول للتحديث' });

        const sql = `UPDATE sponsor_organizations SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
        await query(sql, params);

        res.json({ message: 'تم التحديث بنجاح' });
    } catch (err) {
        next(err);
    }
});

export default router;
