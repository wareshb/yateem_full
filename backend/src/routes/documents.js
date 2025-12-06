import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), config.uploadDir);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage });

router.get('/', async (req, res, next) => {
  try {
    const { owner_type, owner_id, category } = req.query;
    const params = {};
    let sql = 'SELECT * FROM documents WHERE 1=1';
    if (owner_type) {
      sql += ' AND owner_type = :owner_type';
      params.owner_type = owner_type;
    }
    if (owner_id) {
      sql += ' AND owner_id = :owner_id';
      params.owner_id = owner_id;
    }
    if (category) {
      sql += ' AND category = :category';
      params.category = category;
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    const { owner_type, owner_id, category, label } = req.body;
    if (!req.file) return res.status(400).json({ message: 'File is required' });
    const filePath = path.join(config.uploadDir, req.file.filename);
    const result = await query(
      `INSERT INTO documents (owner_type, owner_id, category, label, file_path, mime_type, file_size)
       VALUES (:owner_type, :owner_id, :category, :label, :file_path, :mime_type, :file_size)`,
      {
        owner_type,
        owner_id,
        category,
        label,
        file_path: filePath,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
      },
    );
    res.status(201).json({ id: result.insertId, file_path: filePath });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const [doc] = await query('SELECT * FROM documents WHERE id = :id', { id: req.params.id });
    if (doc?.file_path) {
      const abs = path.join(process.cwd(), doc.file_path);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await query('DELETE FROM documents WHERE id = :id', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;