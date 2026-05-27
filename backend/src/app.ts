import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import { config } from './config';
import { errorHandler, notFound } from './middleware/error';
import { authRouter } from './routes/auth';
import { healthRouter } from './routes/health';
import { itemsRouter } from './routes/items';
import { uploadsRouter } from './routes/uploads';

export function createApp() {
  const app = express();

  const origins =
    config.corsOrigin === '*'
      ? true
      : config.corsOrigin.split(',').map(s => s.trim());

  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '1mb' }));

  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(config.uploadDir));

  app.use(healthRouter);
  app.use(authRouter);
  app.use(itemsRouter);
  app.use(uploadsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
