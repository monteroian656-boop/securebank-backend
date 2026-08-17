import { Request, Response } from 'express';
import { fail } from '../utils/response';

export const notFoundMiddleware = (req: Request, res: Response) => {
  fail(res, 404, 'NOT_FOUND', `Ruta no encontrada: ${req.originalUrl}`);
};
