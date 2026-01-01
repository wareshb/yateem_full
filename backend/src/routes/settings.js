import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { query } from '../db.js';
import { config } from '../config.js';

const router = Router();

// Configure Multer for logo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `org_logo_${Date.now()}${ext}`);
    },
});
const upload = multer({ storage });

// GET /api/settings - Fetch system settings
router.get('/', async (req, res, next) => {
    try {
        const [settings] = await query('SELECT * FROM system_settings LIMIT 1');
        res.json(settings || {});
    } catch (err) {
        next(err);
    }
});

// PUT /api/settings - Update system settings
router.put('/', async (req, res, next) => {
    try {
        const {
            org_name,
            org_description,
            address_country,
            address_city,
            address_street,
            phone_1,
            phone_2,
            email,
            website,
            smtp_host,
            smtp_user,
            smtp_pass,
            smtp_port,
            default_currency,
        } = req.body;

        // Check if settings exist
        const [existing] = await query('SELECT id FROM system_settings LIMIT 1');

        if (existing) {
            await query(
                `UPDATE system_settings SET 
          org_name = ?, org_description = ?, 
          address_country = ?, address_city = ?, address_street = ?, 
          phone_1 = ?, phone_2 = ?, email = ?, website = ?,
          smtp_host = ?, smtp_user = ?, smtp_pass = ?, smtp_port = ?,
          default_currency = ?
         WHERE id = ?`,
                [
                    org_name, org_description,
                    address_country, address_city, address_street,
                    phone_1, phone_2, email, website,
                    smtp_host, smtp_user, smtp_pass, smtp_port,
                    default_currency,
                    existing.id,
                ]
            );
        } else {
            await query(
                `INSERT INTO system_settings (
          org_name, org_description, 
          address_country, address_city, address_street, 
          phone_1, phone_2, email, website,
          smtp_host, smtp_user, smtp_pass, smtp_port,
          default_currency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    org_name, org_description,
                    address_country, address_city, address_street,
                    phone_1, phone_2, email, website,
                    smtp_host, smtp_user, smtp_pass, smtp_port,
                    default_currency,
                ]
            );
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        next(err);
    }
});

// POST /api/settings/upload-logo - Upload logo
router.post('/upload-logo', upload.single('logo'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const logoPath = `/uploads/${req.file.filename}`;

        // Update DB
        const [existing] = await query('SELECT id FROM system_settings LIMIT 1');
        if (existing) {
            await query('UPDATE system_settings SET org_logo = ? WHERE id = ?', [logoPath, existing.id]);
        } else {
            await query('INSERT INTO system_settings (org_logo) VALUES (?)', [logoPath]);
        }

        res.json({ url: logoPath });
    } catch (err) {
        next(err);
    }
});

// GET /api/settings/banks - List bank accounts
router.get('/banks', async (req, res, next) => {
    try {
        const banks = await query('SELECT * FROM organization_bank_accounts ORDER BY id DESC');
        res.json(banks);
    } catch (err) {
        next(err);
    }
});

// POST /api/settings/banks - Add bank account
router.post('/banks', async (req, res, next) => {
    try {
        const { bank_name, account_number, iban, currency } = req.body;
        await query(
            'INSERT INTO organization_bank_accounts (bank_name, account_number, iban, currency) VALUES (?, ?, ?, ?)',
            [bank_name, account_number, iban, currency]
        );
        res.status(201).json({ message: 'Bank account added' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/settings/banks/:id - Delete bank account
router.delete('/banks/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM organization_bank_accounts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Bank account deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;
