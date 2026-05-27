import type { Request, Response, NextFunction } from 'express';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'NotFound' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);
  const message =
    err instanceof Error ? err.message : 'Internal server error';
  const status =
    message.includes('exists') || message.includes('required') ? 400 : 500;
  res.status(status).json({ error: 'ServerError', message });
}
