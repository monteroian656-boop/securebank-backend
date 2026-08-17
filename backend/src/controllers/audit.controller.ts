import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { UnauthorizedError } from '../utils/errors';
import { ok } from '../utils/response';

export const auditController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      const { userId, from, to } = req.query as { userId?: string; from?: string; to?: string };
      ok(res, await auditService.list(req.auth.tenantId, { userId, from, to }));
    } catch (error) {
      next(error);
    }
  },

  exportSigned: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      const { from, to } = req.query as { from?: string; to?: string };
      ok(res, await auditService.exportSigned(req.auth.tenantId, { from, to }));
    } catch (error) {
      next(error);
    }
  },
};
