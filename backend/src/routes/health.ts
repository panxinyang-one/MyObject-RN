import { Router } from 'express';
import { pingDb } from '../db/pool';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const dbOk = await pingDb();
  const status = dbOk ? 200 : 503;
  res.status(status).json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'ok' : 'down',
    timestamp: new Date().toISOString(),
  });
});
