import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import * as itemService from '../services/itemService';

export const itemsRouter = Router();

itemsRouter.use(requireAuth);

itemsRouter.get('/items', async (req: AuthedRequest, res, next) => {
  try {
    const items = await itemService.listItems(req.user!.userId);
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

itemsRouter.post('/items', async (req: AuthedRequest, res, next) => {
  try {
    const item = await itemService.createItem(req.user!.userId, req.body ?? {});
    res.status(201).json({ item });
  } catch (e) {
    next(e);
  }
});

itemsRouter.patch('/items/:id', async (req: AuthedRequest, res, next) => {
  try {
    const item = await itemService.updateItem(
      req.user!.userId,
      req.params.id,
      req.body ?? {},
    );
    if (!item) {
      res.status(404).json({ error: 'NotFound', message: 'Item not found' });
      return;
    }
    res.json({ item });
  } catch (e) {
    next(e);
  }
});

itemsRouter.delete('/items/:id', async (req: AuthedRequest, res, next) => {
  try {
    const ok = await itemService.deleteItem(req.user!.userId, req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'NotFound', message: 'Item not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

itemsRouter.post('/items/:id/toggle-pin', async (req: AuthedRequest, res, next) => {
  try {
    const item = await itemService.togglePin(req.user!.userId, req.params.id);
    if (!item) {
      res.status(404).json({ error: 'NotFound', message: 'Item not found' });
      return;
    }
    res.json({ item });
  } catch (e) {
    next(e);
  }
});
