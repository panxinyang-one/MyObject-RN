import { Router } from 'express';
import { pingDb } from '../db/pool';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  // Health check: 用于 CI/CD 和运维探活（需要保证 2xx 才算通过）
  const dbOk = await pingDb();
  const status = dbOk ? 200 : 503;
  res.status(status).json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'ok' : 'down',
    timestamp: new Date().toISOString(),
  });
});
