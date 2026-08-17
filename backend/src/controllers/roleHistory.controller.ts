import { Request, Response, NextFunction } from 'express';
import { roleHistoryService } from '../services/roleHistory.service';
import { UnauthorizedError } from '../utils/errors';
import { ok } from '../utils/response';

export const roleHistoryController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      const { roleId, changedBy } = req.query as { roleId?: string; changedBy?: string };
      ok(res, await roleHistoryService.list(req.auth.tenantId, { roleId, changedBy }));
    } catch (error) {
      next(error);
    }
  },
};
