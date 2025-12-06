import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    const params = { limit: Number(limit), offset: (Number(page) - 1) * Number(limit) };
    let sql = 'SELECT * FROM guardians WHERE 1=1';
    if (search) {
      sql += ' AND full_name LIKE :search';
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
      full_name,
      date_of_birth,
      national_id,
      relationship_to_child,
      contact_phone,
      address,
      occupation,
      monthly_income,
      health_status,
      notes,
    } = req.body;
    const result = await query(
      `INSERT INTO guardians
       (full_name, date_of_birth, national_id, relationship_to_child, contact_phone, address, occupation, monthly_income, health_status, notes)
       VALUES (:full_name, :date_of_birth, :national_id, :relationship_to_child, :contact_phone, :address, :occupation, :monthly_income, :health_status, :notes)`,
      {
        full_name,
        date_of_birth,
        national_id,
        relationship_to_child,
        contact_phone,
        address,
        occupation,
        monthly_income,
        health_status,
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
    const [guardian] = await query('SELECT * FROM guardians WHERE id = :id', { id: req.params.id });
    if (!guardian) return res.status(404).json({ message: 'Guardian not found' });
    const orphans = await query(
      `SELECT o.*
       FROM orphans_guardians og
       JOIN orphans o ON o.id = og.orphan_id
       WHERE og.guardian_id = :id`,
      { id: req.params.id },
    );
    res.json({ ...guardian, orphans });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const allowed = [
      'full_name',
      'date_of_birth',
      'national_id',
      'relationship_to_child',
      'contact_phone',
      'address',
      'occupation',
      'monthly_income',
      'health_status',
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
    const sql = `UPDATE guardians SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
    await query(sql, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await query('DELETE FROM guardians WHERE id = :id', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;