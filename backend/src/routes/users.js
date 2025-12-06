import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const rows = await query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (:full_name, :email, :password_hash, :role)',
      { full_name, email, password_hash, role },
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const allowed = ['full_name', 'email', 'role'];
    const updates = [];
    const params = { id: req.params.id };
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = :${field}`);
        params[field] = req.body[field];
      }
    });
    if (req.body.password) {
      updates.push('password_hash = :password_hash');
      params.password_hash = await bcrypt.hash(req.body.password, 10);
    }
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
    await query(sql, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    await query('DELETE FROM users WHERE id = :id', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;