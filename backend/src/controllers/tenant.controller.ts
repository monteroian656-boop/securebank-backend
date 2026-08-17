import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { tenantService } from '../services/tenant.service';
import { ok } from '../utils/response';

export const tenantController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await tenantService.list());
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = z.object({ name: z.string() }).parse(req.body);
      const tenant = await tenantService.create(name);
      ok(res, tenant, 201);
    } catch (error) {
      next(error);
    }
  },
};
