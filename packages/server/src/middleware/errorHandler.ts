import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    res.status(400).json({
      error: 'Validation error',
      details: err instanceof Error && 'issues' in err ? (err as any).issues : undefined,
    });
    return;
  }

  // SQLite unique constraint
  if ((err as any).code === 'SQLITE_CONSTRAINT') {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
