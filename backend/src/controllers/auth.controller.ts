import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { tenantRepository } from '../repositories/tenant.repository';
import { UnauthorizedError } from '../utils/errors';
import { ok } from '../utils/response';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const ip = req.ip ?? 'unknown';
      const { token, user } = await authService.login(email, password, ip, req.headers['user-agent']);
      const tenant = await tenantRepository.findById(user.tenantId);
      ok(res, { token, user, tenant });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth) {
        await authService.logout(req.auth.sessionId, req.auth.userId);
      }
      ok(res, { success: true });
    } catch (error) {
      next(error);
    }
  },

  requestPasswordReset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = z.string().email().parse(req.body.email);
      const token = await authService.requestPasswordReset(email);
      // En producción esto se envía por correo y NUNCA se devuelve en la
      // respuesta. En dev lo devolvemos para poder probar el flujo sin
      // tener un servicio de correo configurado.
      if (token) console.log(`[DEV] Enlace de reset para ${email}: token=${token}`);
      const devToken = process.env.NODE_ENV !== 'production' ? token : undefined;
      ok(res, { sent: true, ...(devToken ? { devToken } : {}) });
    } catch (error) {
      next(error);
    }
  },

  confirmPasswordReset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = z
        .object({ token: z.string(), newPassword: z.string() })
        .parse(req.body);
      await authService.confirmPasswordReset(token, newPassword);
      ok(res, { success: true });
    } catch (error) {
      next(error);
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      ok(res, await authService.me(req.auth.userId, req.auth.tenantId));
    } catch (error) {
      next(error);
    }
  },
};
