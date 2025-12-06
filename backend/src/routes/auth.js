import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { config } from '../config.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, password, role = 'admin' } = req.body;
    const [existing] = await query('SELECT COUNT(*) AS count FROM users');
    if (existing.count > 0) {
      return res.status(400).json({ message: 'Registration closed. Use admin to add users.' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (:full_name, :email, :password_hash, :role)',
      { full_name, email, password_hash, role },
    );
    const token = jwt.sign({ id: result.insertId, role, full_name, email }, config.jwtSecret, { expiresIn: '8h' });
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [user] = await query('SELECT * FROM users WHERE email = :email', { email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, role: user.role, full_name: user.full_name, email: user.email },
      config.jwtSecret,
      { expiresIn: '8h' },
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const [user] = await query('SELECT id, full_name, email, role FROM users WHERE id = :id', {
      id: req.user.id,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;