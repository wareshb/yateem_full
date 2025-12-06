import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { type, search, limit = 20, page = 1 } = req.query;
    const params = { limit: Number(limit), offset: (Number(page) - 1) * Number(limit) };
    let sql = 'SELECT * FROM sponsors WHERE 1=1';
    if (type) {
      sql += ' AND sponsor_type = :type';
      params.type = type;
    }
    if (search) {
      sql += ' AND name LIKE :search';
      params.search = `%${search}%`;
    }
    sql += ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      sponsor_type,
      name,
      address,
      phone,
      email,
      sponsorship_terms,
      sponsorship_type,
      payment_method,
      start_date,
      end_date,
      notes,
    } = req.body;
    const result = await query(
      `INSERT INTO sponsors
       (sponsor_type, name, address, phone, email, sponsorship_terms, sponsorship_type, payment_method, start_date, end_date, notes)
       VALUES (:sponsor_type, :name, :address, :phone, :email, :sponsorship_terms, :sponsorship_type, :payment_method, :start_date, :end_date, :notes)`,
      {
        sponsor_type,
        name,
        address,
        phone,
        email,
        sponsorship_terms,
        sponsorship_type,
        payment_method,
        start_date,
        end_date,
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
    const [sponsor] = await query('SELECT * FROM sponsors WHERE id = :id', { id: req.params.id });
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    const children = await query(
      `SELECT o.* FROM orphans_sponsors os
       JOIN orphans o ON o.id = os.orphan_id
       WHERE os.sponsor_id = :id`,
      { id: req.params.id },
    );
    res.json({ ...sponsor, children });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const allowed = [
      'sponsor_type',
      'name',
      'address',
      'phone',
      'email',
      'sponsorship_terms',
      'sponsorship_type',
      'payment_method',
      'start_date',
      'end_date',
      'notes',
    ];
    const params = { id: req.params.id };
    const updates = [];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = :${field}`);
        params[field] = req.body[field];
      }
    });
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    const sql = `UPDATE sponsors SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
    await query(sql, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await query('DELETE FROM sponsors WHERE id = :id', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;