import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service';
import { UnauthorizedError } from '../utils/errors';
import { ok } from '../utils/response';

export const userController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      ok(res, await userService.list(req.auth.tenantId));
    } catch (error) {
      next(error);
    }
  },

  assignRole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      const { roleId } = z.object({ roleId: z.string() }).parse(req.body);
      ok(res, await userService.assignRole(req.auth.tenantId, String(req.params.id), roleId));
    } catch (error) {
      next(error);
    }
  },

  revoke: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      ok(res, await userService.revoke(req.auth.tenantId, String(req.params.id)));
    } catch (error) {
      next(error);
    }
  },

  wouldDeactivateCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      ok(res, { count: await userService.wouldDeactivateCount(req.auth.tenantId) });
    } catch (error) {
      next(error);
    }
  },
};
