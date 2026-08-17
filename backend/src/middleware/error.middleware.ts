import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { fail } from '../utils/response';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    fail(res, err.status, err.code, err.message);
    return;
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first.path.join('.');
    const message = field ? `${field}: ${first.message}` : first.message;
    fail(res, 422, 'VALIDATION_ERROR', message);
    return;
  }
  console.error(err);
  fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
};
