import { NextFunction, Request, Response } from 'express';
import { roleRepository } from '../repositories/role.repository';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
// Verificación de permisos en el backend, el frontend oculta
//botones/pantallas según el permiso del roles en UX. Sin el middleware cualquiera que posea un token valido
//podria ingresar directamente




//Consulta de rol en vivo para remover los permisos automaticamente y no cuando la sesión expire
export function requirePermission(permission: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw new UnauthorizedError();
      const role = await roleRepository.findById(req.auth.roleId);
      if (!role || !role.permissions.includes(permission)) {
        throw new ForbiddenError(`Esta acción requiere el permiso "${permission}".`);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
