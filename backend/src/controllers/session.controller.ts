import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/session.service';
import { UnauthorizedError } from '../utils/errors';
import { ok } from '../utils/response';

export const sessionController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      ok(res, await sessionService.listActive(req.auth.userId));
    } catch (error) {
      next(error);
    }
  },

  closeOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      await sessionService.closeOne(String(req.params.id), req.auth.userId);
      ok(res, { success: true });
    } catch (error) {
      next(error);
    }
  },

  closeAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      await sessionService.closeAll(req.auth.userId);
      ok(res, { success: true });
    } catch (error) {
      next(error);
    }
  },
};
