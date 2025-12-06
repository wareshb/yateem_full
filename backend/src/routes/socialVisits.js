import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { orphanId, visitorId, limit = 20, page = 1 } = req.query;
    const params = { limit: Number(limit), offset: (Number(page) - 1) * Number(limit) };
    let sql = `
      SELECT sv.*, o.full_name AS orphan_name
      FROM social_visits sv
      LEFT JOIN orphans o ON o.id = sv.orphan_id
      WHERE 1=1`;
    if (orphanId) {
      sql += ' AND sv.orphan_id = :orphanId';
      params.orphanId = orphanId;
    }
    if (visitorId) {
      sql += ' AND sv.visitor_user_id = :visitorId';
      params.visitorId = visitorId;
    }
    sql += ' ORDER BY sv.visit_date DESC LIMIT :limit OFFSET :offset';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { orphan_id, visitor_user_id, visit_date, score, notes, recommendations } = req.body;
    const result = await query(
      `INSERT INTO social_visits (orphan_id, visitor_user_id, visit_date, score, notes, recommendations)
       VALUES (:orphan_id, :visitor_user_id, :visit_date, :score, :notes, :recommendations)`,
      {
        orphan_id,
        visitor_user_id,
        visit_date,
        score,
        notes,
        recommendations,
      },
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [visit] = await query('SELECT * FROM social_visits WHERE id = :id', { id: req.params.id });
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    res.json(visit);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const allowed = ['visit_date', 'score', 'notes', 'recommendations'];
    const params = { id: req.params.id };
    const updates = [];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = :${field}`);
        params[field] = req.body[field];
      }
    });
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    const sql = `UPDATE social_visits SET ${updates.join(', ')}, updated_at = NOW() WHERE id = :id`;
    await query(sql, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await query('DELETE FROM social_visits WHERE id = :id', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;