import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const orphanId = req.params.orphanId || req.body.orphan_id;

        if (!orphanId) {
            return cb(new Error('معرف اليتيم مطلوب'));
        }

        // Get orphan UID for folder structure
        const [orphan] = await query('SELECT uid FROM orphans WHERE id = :id', { id: orphanId });
        if (!orphan) {
            return cb(new Error('اليتيم غير موجود'));
        }

        // Determine subfolder based on attachment type
        const attachmentType = req.body.attachment_type || 'other';
        let subfolder = 'other';

        if (attachmentType.includes('photo')) {
            subfolder = 'photos';
        } else if (attachmentType.includes('certificate')) {
            subfolder = 'certificates';
        } else if (attachmentType === 'medical_report') {
            subfolder = 'medical';
        }

        const uploadPath = path.join('uploads', 'orphans', orphan.uid, subfolder);

        // Create directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const attachmentType = req.body.attachment_type || 'file';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${attachmentType}_${timestamp}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('نوع الملف غير مسموح. الأنواع المسموحة: JPG, PNG, PDF'));
        }
    }
});

// POST /api/orphans/:orphanId/attachments - Upload attachment
router.post('/orphans/:orphanId/attachments', authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'الملف مطلوب' });
        }

        const { attachment_type } = req.body;
        const orphanId = req.params.orphanId;

        if (!attachment_type) {
            return res.status(400).json({ message: 'نوع المرفق مطلوب' });
        }

        const result = await query(`
      INSERT INTO attachments (orphan_id, attachment_type, file_path, file_name, mime_type, file_size)
      VALUES (:orphan_id, :attachment_type, :file_path, :file_name, :mime_type, :file_size)
    `, {
            orphan_id: orphanId,
            attachment_type,
            file_path: req.file.path,
            file_name: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size: req.file.size
        });

        res.status(201).json({
            id: result.insertId,
            message: 'تم رفع المرفق بنجاح',
            file: {
                path: req.file.path,
                name: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (err) {
        // Delete uploaded file if database insert fails
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (deleteErr) {
                console.error('خطأ في حذف الملف:', deleteErr);
            }
        }
        next(err);
    }
});

// GET /api/orphans/:orphanId/attachments - Get attachments for orphan
router.get('/orphans/:orphanId/attachments', async (req, res, next) => {
    try {
        const attachments = await query(`
      SELECT * FROM attachments 
      WHERE orphan_id = :orphanId 
      ORDER BY attachment_type, created_at DESC
    `, { orphanId: req.params.orphanId });

        res.json(attachments);
    } catch (err) {
        next(err);
    }
});

// GET /api/attachments/:id/download - Download attachment
router.get('/:id/download', async (req, res, next) => {
    try {
        const [attachment] = await query('SELECT * FROM attachments WHERE id = :id', { id: req.params.id });

        if (!attachment) {
            return res.status(404).json({ message: 'المرفق غير موجود' });
        }

        if (!fs.existsSync(attachment.file_path)) {
            return res.status(404).json({ message: 'الملف غير موجود على الخادم' });
        }

        res.download(attachment.file_path, attachment.file_name);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/attachments/:id - Delete attachment
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const [attachment] = await query('SELECT * FROM attachments WHERE id = :id', { id: req.params.id });

        if (!attachment) {
            return res.status(404).json({ message: 'المرفق غير موجود' });
        }

        // Delete file from filesystem
        if (fs.existsSync(attachment.file_path)) {
            fs.unlinkSync(attachment.file_path);
        }

        // Delete from database
        await query('DELETE FROM attachments WHERE id = :id', { id: req.params.id });

        res.json({ message: 'تم حذف المرفق بنجاح' });
    } catch (err) {
        next(err);
    }
});

export default router;
