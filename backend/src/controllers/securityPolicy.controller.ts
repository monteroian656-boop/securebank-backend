import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { securityPolicyService } from '../services/securityPolicy.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { ok } from '../utils/response';

// HU-09: un admin solo puede leer/editar la política de SU propia entidad, nunca la de otra por más que cambie
//el :tenantId en la URL
function assertOwnTenant(req: Request) {
  if (!req.auth) throw new UnauthorizedError();
  if (req.auth.tenantId !== req.params.tenantId) {
    throw new ForbiddenError('No podés ver ni modificar la configuración de otra entidad bancaria.');
  }
}


const securityPolicyPatchSchema = z
  .object({
    minLength: z.number().int(),
    expirationDays: z.number().int(),
    requireComplexity: z.boolean(),
    inactivityDays: z.number().int(),
    lockoutMinutes: z.number().int(),
  })
  .partial();

export const securityPolicyController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      assertOwnTenant(req);
      ok(res, await securityPolicyService.get(String(req.params.tenantId)));
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      assertOwnTenant(req);
      const patch = securityPolicyPatchSchema.parse(req.body);
      ok(res, await securityPolicyService.update(String(req.params.tenantId), patch));
    } catch (error) {
      next(error);
    }
  },
};
