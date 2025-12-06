import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/marketing-organizations - Get all marketing organizations
router.get('/', async (req, res, next) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT * FROM marketing_organizations WHERE 1=1';
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

// POST /api/marketing-organizations - Create marketing organization
router.post('/', authenticate, async (req, res, next) => {
    try {
        const uid = uuidv4();
        const { name, email, phone, responsible_person, marketing_date, notes } = req.body;

        const result = await query(`
      INSERT INTO marketing_organizations (uid, name, email, phone, responsible_person, marketing_date, notes)
      VALUES (:uid, :name, :email, :phone, :responsible_person, :marketing_date, :notes)
    `, { uid, name, email, phone, responsible_person, marketing_date, notes });

        res.status(201).json({ id: result.insertId, uid, message: 'تم إضافة جهة التسويق بنجاح' });
    } catch (err) {
        next(err);
    }
});

// GET /api/marketing-organizations/:id - Get marketing organization details
router.get('/:id', async (req, res, next) => {
    try {
        const [org] = await query('SELECT * FROM marketing_organizations WHERE id = :id', { id: req.params.id });
        if (!org) return res.status(404).json({ message: 'جهة التسويق غير موجودة' });
        res.json(org);
    } catch (err) {
        next(err);
    }
});

// POST /api/marketing-organizations/:id/orphans - Market orphans to organization
router.post('/:id/orphans', authenticate, async (req, res, next) => {
    try {
        const { orphan_ids, marketing_date, notes } = req.body;
        const marketing_org_id = req.params.id;

        if (!Array.isArray(orphan_ids) || orphan_ids.length === 0) {
            return res.status(400).json({ message: 'يجب تحديد أيتام للتسويق' });
        }

        // Insert marketing records
        for (const orphan_id of orphan_ids) {
            await query(`
        INSERT INTO marketing_records (marketing_organization_id, orphan_id, marketing_date, status, notes)
        VALUES (:marketing_org_id, :orphan_id, :marketing_date, 'pending', :notes)
      `, {
                marketing_org_id,
                orphan_id,
                marketing_date: marketing_date || new Date().toISOString().split('T')[0],
                notes
            });
        }

        res.json({ message: `تم تسويق ${orphan_ids.length} يتيم/أيتام للجهة` });
    } catch (err) {
        next(err);
    }
});

// GET /api/marketing-organizations/:id/orphans - Get marketed orphans
router.get('/:id/orphans', async (req, res, next) => {
    try {
        const orphans = await query(`
      SELECT o.*, m.marketing_date, m.status as marketing_status, m.notes as marketing_notes,
        r.province, r.district
      FROM marketing_records m
      JOIN orphans o ON o.id = m.orphan_id
      LEFT JOIN residence_info r ON r.id = o.residence_id
      WHERE m.marketing_organization_id = :id
      ORDER BY m.marketing_date DESC
    `, { id: req.params.id });

        res.json(orphans);
    } catch (err) {
        next(err);
    }
});

// POST /api/marketing-organizations/:id/convert-to-sponsor - Convert to sponsor organization
router.post('/:id/convert-to-sponsor', authenticate, async (req, res, next) => {
    try {
        const marketing_org_id = req.params.id;
        const { sponsorship_type, start_date, sponsored_orphan_ids } = req.body;

        // Get marketing org details
        const [marketingOrg] = await query('SELECT * FROM marketing_organizations WHERE id = :id', { id: marketing_org_id });
        if (!marketingOrg) {
            return res.status(404).json({ message: 'جهة التسويق غير موجودة' });
        }

        if (marketingOrg.converted_to_sponsor) {
            return res.status(400).json({ message: 'تم تحويل هذه الجهة مسبقاً' });
        }

        // Create sponsor organization
        const sponsorUid = uuidv4();
        const sponsorResult = await query(`
      INSERT INTO sponsor_organizations (uid, name, email, phone, sponsorship_type, responsible_person, start_date, notes)
      VALUES (:uid, :name, :email, :phone, :sponsorship_type, :responsible_person, :start_date, :notes)
    `, {
            uid: sponsorUid,
            name: marketingOrg.name,
            email: marketingOrg.email,
            phone: marketingOrg.phone,
            sponsorship_type: sponsorship_type || 'نقدية',
            responsible_person: marketingOrg.responsible_person,
            start_date: start_date || new Date().toISOString().split('T')[0],
            notes: `تم التحويل من جهة تسويق - ${marketingOrg.notes || ''}`
        });

        const sponsor_id = sponsorResult.insertId;

        // Update marketing org
        await query(`
      UPDATE marketing_organizations 
      SET converted_to_sponsor = TRUE, sponsor_organization_id = :sponsor_id 
      WHERE id = :id
    `, { id: marketing_org_id, sponsor_id });

        // Create sponsorships for selected orphans
        if (Array.isArray(sponsored_orphan_ids) && sponsored_orphan_ids.length > 0) {
            for (const orphan_id of sponsored_orphan_ids) {
                await query(`
          INSERT INTO sponsorships (sponsor_organization_id, orphan_id, start_date, status, notes)
          VALUES (:sponsor_id, :orphan_id, :start_date, 'active', 'تم التحويل من التسويق')
        `, { sponsor_id, orphan_id, start_date: start_date || new Date().toISOString().split('T')[0] });

                // Update marketing record status
                await query(`
          UPDATE marketing_records 
          SET status = 'converted_to_sponsorship' 
          WHERE marketing_organization_id = :marketing_org_id AND orphan_id = :orphan_id
        `, { marketing_org_id, orphan_id });
            }
        }

        res.json({
            message: 'تم التحويل لجهة كافلة بنجاح',
            sponsor_organization_id: sponsor_id,
            sponsored_orphans_count: sponsored_orphan_ids?.length || 0
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/marketing-organizations/:id - Update marketing organization
router.patch('/:id', authenticate, async (req, res, next) => {
    try {
        const fields = req.body;
        const allowed = ['name', 'email', 'phone', 'responsible_person', 'marketing_date', 'notes'];

        const updates = [];
        const params = { id: req.params.id };

        allowed.forEach((field) => {
            if (fields[field] !== undefined) {
                updates.push(`${field} = :${field}`);
                params[field] = fields[field];
            }
        });

        if (!updates.length) return res.status(400).json({ message: 'لا توجد حقول للتحديث' });

        const sql = `UPDATE marketing_organizations SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
        await query(sql, params);

        res.json({ message: 'تم التحديث بنجاح' });
    } catch (err) {
        next(err);
    }
});

export default router;
