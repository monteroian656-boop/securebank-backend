import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { roleService } from '../services/role.service';
import { UnauthorizedError } from '../utils/errors';
import { ok } from '../utils/response';

const roleBodySchema = z.object({
  name: z.string(),
  permissions: z.array(z.string()),
});

export const roleController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      ok(res, await roleService.list(req.auth.tenantId));
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      const { name, permissions } = roleBodySchema.parse(req.body);
      const role = await roleService.create(req.auth.tenantId, name, permissions);
      ok(res, role, 201);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      const { name, permissions } = roleBodySchema.parse(req.body);
      const role = await roleService.update(req.auth.tenantId, String(req.params.id), req.auth.userId, name, permissions);
      ok(res, role);
    } catch (error) {
      next(error);
    }
  },
};
