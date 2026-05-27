import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';

export const uploadsRouter = Router();

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads allowed'));
      return;
    }
    cb(null, true);
  },
});

uploadsRouter.post(
  '/uploads',
  requireAuth,
  upload.single('image'),
  (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Validation', message: 'image file required' });
        return;
      }
      const url = `/uploads/${req.file.filename}`;
      res.status(201).json({
        url,
        imageUri: `${config.publicBaseUrl}${url}`,
      });
    } catch (e) {
      next(e);
    }
  },
);
