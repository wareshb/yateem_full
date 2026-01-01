import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/organizations - List organizations with filters
router.get('/', async (req, res, next) => {
    try {
        const { search, type } = req.query;
        let sql = 'SELECT * FROM organizations WHERE 1=1';
        const params = {};

        if (search) {
            sql += ' AND (name LIKE :search OR email LIKE :search OR phone LIKE :search)';
            params.search = `%${search}%`;
        }

        if (type === 'sponsor') {
            sql += ' AND is_sponsor = TRUE';
        } else if (type === 'marketing') {
            sql += ' AND is_marketing = TRUE';
        }

        sql += ' ORDER BY name';
        const orgs = await query(sql, params);
        res.json(orgs);
    } catch (err) {
        next(err);
    }
});

// POST /api/organizations - Create unified organization
router.post('/', authenticate, async (req, res, next) => {
    try {
        const uid = uuidv4();
        const {
            name, email, phone, responsible_person, start_date, notes,
            is_sponsor, is_marketing
        } = req.body;

        const result = await query(`
            INSERT INTO organizations (uid, name, email, phone, responsible_person, start_date, notes, is_sponsor, is_marketing)
            VALUES (:uid, :name, :email, :phone, :responsible_person, :start_date, :notes, :is_sponsor, :is_marketing)
        `, {
            uid, name, email, phone, responsible_person, start_date, notes,
            is_sponsor: is_sponsor ? 1 : 0,
            is_marketing: is_marketing ? 1 : 0
        });

        res.status(201).json({ id: result.insertId, uid, message: 'تم إضافة الجهة بنجاح' });
    } catch (err) {
        next(err);
    }
});

// PUT /api/organizations/:id - Update organization
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const {
            name, email, phone, responsible_person, start_date, notes,
            is_sponsor, is_marketing
        } = req.body;

        // Start date is primarily for sponsors, but can be used generally. 
        // Marketing date logic might be separate in records, but for the org itself, start_date is fine.

        await query(`
            UPDATE organizations SET
                name = :name,
                email = :email,
                phone = :phone,
                responsible_person = :responsible_person,
                start_date = :start_date,
                notes = :notes,
                is_sponsor = :is_sponsor,
                is_marketing = :is_marketing,
                updated_at = NOW()
            WHERE id = :id
        `, {
            name, email, phone, responsible_person, start_date, notes,
            is_sponsor: is_sponsor ? 1 : 0,
            is_marketing: is_marketing ? 1 : 0,
            id: req.params.id
        });

        res.json({ message: 'تم تحديث البيانات بنجاح' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/organizations/:id - Delete organization
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const id = req.params.id;
        // Check for dependencies or rely on CASCADE if set (migration set CASCADE)
        // Ideally checking first is safer for user feedback

        await query('DELETE FROM organizations WHERE id = ?', [id]);
        res.json({ message: 'تم حذف الجهة بنجاح' });
    } catch (err) {
        next(err);
    }
});

// GET /api/organizations/:id - Get details
router.get('/:id', async (req, res, next) => {
    try {
        const [org] = await query('SELECT * FROM organizations WHERE id = ?', [req.params.id]);
        if (!org) return res.status(404).json({ message: 'الجهة غير موجودة' });
        res.json(org);
    } catch (err) {
        next(err);
    }
});


// === Sponsorship Actions ===

// POST /api/organizations/:id/sponsorships - Add Sponsorship Group
router.post('/:id/sponsorships', authenticate, async (req, res, next) => {
    try {
        const { orphan_ids, start_date, notes } = req.body;
        const organization_id = req.params.id;

        if (!Array.isArray(orphan_ids) || orphan_ids.length === 0) {
            return res.status(400).json({ message: 'يجب تحديد أيتام للكفالة' });
        }

        // Ensure org is marked as sponsor
        await query('UPDATE organizations SET is_sponsor = TRUE WHERE id = ?', [organization_id]);

        for (const orphan_id of orphan_ids) {
            // Note: Using organization_id column created by migration
            await query(`
                INSERT INTO sponsorships (organization_id, orphan_id, start_date, status, notes)
                VALUES (:organization_id, :orphan_id, :start_date, 'active', :notes)
                ON DUPLICATE KEY UPDATE status = 'active', start_date = VALUES(start_date)
            `, {
                organization_id,
                orphan_id,
                start_date: start_date || new Date().toISOString().split('T')[0],
                notes
            });
        }

        res.json({ message: `تم ربط ${orphan_ids.length} يتيم/أيتام بالكفالة` });
    } catch (err) {
        next(err);
    }
});

// GET /api/organizations/:id/sponsorships - Get sponsored orphans
router.get('/:id/sponsorships', async (req, res, next) => {
    try {
        const orphans = await query(`
            SELECT o.*, s.start_date, s.status, s.notes as sponsorship_notes
            FROM sponsorships s
            JOIN orphans o ON o.id = s.orphan_id
            WHERE s.organization_id = ? AND s.status = 'active'
        `, [req.params.id]);
        res.json(orphans);
    } catch (err) {
        next(err);
    }
});


// === Marketing Actions ===

// POST /api/organizations/:id/marketing - Add Marketing Group
router.post('/:id/marketing', authenticate, async (req, res, next) => {
    try {
        const { orphan_ids, marketing_date, notes } = req.body;
        const organization_id = req.params.id;

        if (!Array.isArray(orphan_ids) || orphan_ids.length === 0) {
            return res.status(400).json({ message: 'يجب تحديد أيتام للتسويق' });
        }

        // Ensure org is marked as marketing
        await query('UPDATE organizations SET is_marketing = TRUE WHERE id = ?', [organization_id]);

        for (const orphan_id of orphan_ids) {
            await query(`
                INSERT INTO marketing_records (organization_id, orphan_id, marketing_date, status, notes)
                VALUES (:organization_id, :orphan_id, :marketing_date, 'pending', :notes)
            `, {
                organization_id,
                orphan_id,
                marketing_date: marketing_date || new Date().toISOString().split('T')[0],
                notes
            });
        }

        res.json({ message: `تم تسويق ${orphan_ids.length} يتيم/أيتام` });
    } catch (err) {
        next(err);
    }
});

// GET /api/organizations/:id/marketing - Get marketed orphans
router.get('/:id/marketing', async (req, res, next) => {
    try {
        const orphans = await query(`
            SELECT o.*, m.marketing_date, m.status, m.notes as marketing_notes
            FROM marketing_records m
            JOIN orphans o ON o.id = m.orphan_id
            WHERE m.organization_id = ?
            ORDER BY m.marketing_date DESC
        `, [req.params.id]);
        res.json(orphans);
    } catch (err) {
        next(err);
    }
});

export default router;
