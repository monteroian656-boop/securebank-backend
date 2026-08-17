import { Request, Response, NextFunction } from 'express';
import { slaService } from '../services/sla.service';
import { UnauthorizedError } from '../utils/errors';
import { ok } from '../utils/response';

// HU-09: el SLA siempre es el de la entidad del usuario logueado
export const slaController = {
  current: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      ok(res, [await slaService.current(req.auth.tenantId)]);
    } catch (error) {
      next(error);
    }
  },

  trend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      ok(res, await slaService.trend(req.auth.tenantId));
    } catch (error) {
      next(error);
    }
  },
};
