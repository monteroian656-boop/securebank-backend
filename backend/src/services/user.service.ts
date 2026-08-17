import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { securityPolicyRepository } from '../repositories/securityPolicy.repository';
import { sessionRepository } from '../repositories/session.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export const userService = {
  async list(tenantId: string) {
    return userRepository.findAllByTenant(tenantId);
  },

  // HU-05: asignar rol a un usuario, verifica que tanto el user como el rol pertenezcan a la entidad correcta
  async assignRole(tenantId: string, userId: string, roleId: string) {
    const role = await roleRepository.findById(roleId);
    if (!role || role.tenantId !== tenantId) {
      throw new ValidationError('El rol indicado no pertenece a tu entidad.');
    }
    const updated = await userRepository.updateRole(userId, tenantId, roleId);
    if (!updated) throw new NotFoundError('Usuario no encontrado en tu entidad.');
    return updated;
  },

  // HU-05: revocar acceso, marcar isActive=false, cierra todas sus sesiones activas al instante
  async revoke(tenantId: string, userId: string) {
    const updated = await userRepository.revoke(userId, tenantId);
    if (!updated) throw new NotFoundError('Usuario no encontrado en tu entidad.');
    await sessionRepository.revokeAllForUser(userId);
    return updated;
  },

  // HU-11: cuántas cuentas se desactivarían con el umbral de inactividad.
  async wouldDeactivateCount(tenantId: string) {
    const policy = await securityPolicyRepository.findByTenant(tenantId);
    const days = policy?.inactivityDays ?? 60;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const users = await userRepository.findInactiveSince(tenantId, cutoff);
    return users.length;
  },
};
