import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, orphanId, sponsorId, limit = 20, page = 1 } = req.query;
    const params = { limit: Number(limit), offset: (Number(page) - 1) * Number(limit) };
    let sql = `
      SELECT sp.*, o.full_name AS orphan_name, s.name AS sponsor_name
      FROM sponsorships sp
      LEFT JOIN orphans o ON o.id = sp.orphan_id
      LEFT JOIN sponsors s ON s.id = sp.sponsor_id
      WHERE 1=1`;
    if (status) {
      sql += ' AND sp.status = :status';
      params.status = status;
    }
    if (orphanId) {
      sql += ' AND sp.orphan_id = :orphanId';
      params.orphanId = orphanId;
    }
    if (sponsorId) {
      sql += ' AND sp.sponsor_id = :sponsorId';
      params.sponsorId = sponsorId;
    }
    sql += ' ORDER BY sp.created_at DESC LIMIT :limit OFFSET :offset';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      orphan_id,
      sponsor_id,
      guardian_id,
      sponsorship_type,
      amount,
      currency = 'USD',
      frequency,
      payment_method,
      start_date,
      end_date,
      status = 'active',
      notes,
    } = req.body;
    const result = await query(
      `INSERT INTO sponsorships
       (orphan_id, sponsor_id, guardian_id, sponsorship_type, amount, currency, frequency, payment_method, start_date, end_date, status, notes)
       VALUES (:orphan_id, :sponsor_id, :guardian_id, :sponsorship_type, :amount, :currency, :frequency, :payment_method, :start_date, :end_date, :status, :notes)`,
      {
        orphan_id,
        sponsor_id,
        guardian_id,
        sponsorship_type,
        amount,
        currency,
        frequency,
        payment_method,
        start_date,
        end_date,
        status,
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
    const [sponsorship] = await query(
      `SELECT sp.*, o.full_name AS orphan_name, s.name AS sponsor_name
       FROM sponsorships sp
       LEFT JOIN orphans o ON o.id = sp.orphan_id
       LEFT JOIN sponsors s ON s.id = sp.sponsor_id
       WHERE sp.id = :id`,
      { id: req.params.id },
    );
    if (!sponsorship) return res.status(404).json({ message: 'Sponsorship not found' });
    const payments = await query('SELECT * FROM sponsorship_payments WHERE sponsorship_id = :id ORDER BY due_date DESC', {
      id: req.params.id,
    });
    res.json({ ...sponsorship, payments });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const allowed = [
      'sponsorship_type',
      'amount',
      'currency',
      'frequency',
      'payment_method',
      'start_date',
      'end_date',
      'status',
      'notes',
    ];
    const updates = [];
    const params = { id: req.params.id };
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = :${field}`);
        params[field] = req.body[field];
      }
    });
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    const sql = `UPDATE sponsorships SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
    await query(sql, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/payments', authenticate, async (req, res, next) => {
  try {
    const { due_date, paid_date, amount, status = 'scheduled', notes } = req.body;
    const result = await query(
      `INSERT INTO sponsorship_payments (sponsorship_id, due_date, paid_date, amount, status, notes)
       VALUES (:sponsorship_id, :due_date, :paid_date, :amount, :status, :notes)`,
      {
        sponsorship_id: req.params.id,
        due_date,
        paid_date,
        amount,
        status,
        notes,
      },
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

export default router;