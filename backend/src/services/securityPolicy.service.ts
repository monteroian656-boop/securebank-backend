import { securityPolicyRepository } from '../repositories/securityPolicy.repository';
import { ValidationError } from '../utils/errors';
import type { SecurityPolicy } from '../types/shared';

export const securityPolicyService = {
  async get(tenantId: string) {
    const policy = await securityPolicyRepository.findByTenant(tenantId);
    // En caso de que nunca se configue, se devuelven los valores por defecto
    return (
      policy ?? {
        tenantId,
        minLength: 10,
        expirationDays: 90,
        requireComplexity: true,
        inactivityDays: 60,
        lockoutMinutes: 15,
      }
    );
  },

  // HU-01: rechaza longitud mínima menor a 8, con el motivo específico
  // HU-11 / HU-19 comparten esta misma tabla, cada una actualiza su subconjunto de campos
  async update(tenantId: string, patch: Partial<Omit<SecurityPolicy, 'tenantId'>>) {
    if (patch.minLength !== undefined && patch.minLength < 8) {
      throw new ValidationError(
        'La longitud mínima no puede ser inferior a 8 caracteres según el estándar NIST SP800-63B aplicado por la entidad.',
      );
    }
    if (patch.lockoutMinutes !== undefined && (patch.lockoutMinutes < 1 || patch.lockoutMinutes > 120)) {
      throw new ValidationError('El bloqueo debe estar entre 1 y 120 minutos.');
    }
    if (patch.inactivityDays !== undefined && patch.inactivityDays <= 0) {
      throw new ValidationError('Los días de inactividad deben ser un número positivo.');
    }
    if (patch.expirationDays !== undefined && patch.expirationDays <= 0) {
      throw new ValidationError('Los días de expiración deben ser un número positivo.');
    }
    return securityPolicyRepository.upsert(tenantId, patch);
  },
};
