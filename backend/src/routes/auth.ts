import { Router } from 'express';
import * as authService from '../services/authService';

export const authRouter = Router();

authRouter.post('/auth/register', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'Validation', message: 'email and password required' });
      return;
    }
    const result = await authService.register(String(email), String(password));
    res.status(201).json(result);
  } catch (e) {
    if (e instanceof Error && e.message === 'Email already exists') {
      res.status(409).json({ error: 'Conflict', message: e.message });
      return;
    }
    next(e);
  }
});

authRouter.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'Validation', message: 'email and password required' });
      return;
    }
    const result = await authService.login(String(email), String(password));
    res.json(result);
  } catch (e) {
    if (e instanceof Error && e.message === 'Invalid email or password') {
      res.status(401).json({ error: 'Unauthorized', message: e.message });
      return;
    }
    next(e);
  }
});
