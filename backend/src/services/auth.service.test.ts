import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// mock up de los repositorios para que los test no toquen Postgres
//unicamente validar la logica del negocio de auth.service
vi.mock('../repositories/user.repository', () => ({
  userRepository: {
    findByEmailWithAuth: vi.fn(),
    resetFailedLogins: vi.fn(),
    registerFailedLogin: vi.fn(),
    findById: vi.fn(),
    updatePasswordHash: vi.fn(),
  },
}));
vi.mock('../repositories/session.repository', () => ({
  sessionRepository: {
    create: vi.fn(),
    revoke: vi.fn(),
    revokeAllForUser: vi.fn(),
  },
}));
vi.mock('../repositories/audit.repository', () => ({
  auditRepository: { create: vi.fn() },
}));
vi.mock('../repositories/passwordReset.repository', () => ({
  passwordResetRepository: {
    create: vi.fn(),
    findByToken: vi.fn(),
    markUsed: vi.fn(),
  },
}));
vi.mock('../repositories/tenant.repository', () => ({
  tenantRepository: { findById: vi.fn() },
}));
vi.mock('../repositories/role.repository', () => ({
  roleRepository: { findById: vi.fn(), findByName: vi.fn() },
}));

import { authService } from './auth.service';
import { userRepository } from '../repositories/user.repository';
import { sessionRepository } from '../repositories/session.repository';
import { passwordResetRepository } from '../repositories/passwordReset.repository';
import { UnauthorizedError, LockedError, ValidationError } from '../utils/errors';

function buildUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    fullName: 'Ana Solano',
    email: 'ana.solano@bancocr.fi.cr',
    isActive: true,
    roleId: 'role-1',
    tenantId: 'tenant-1',
    createdAt: new Date(),
    passwordHash: bcrypt.hashSync('SecureBank123!', 10),
    mfaEnabled: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    ...overrides,
  };
}

describe('authService.login (HU-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve token y usuario público con credenciales correctas', async () => {
    const user = buildUser();
    vi.mocked(userRepository.findByEmailWithAuth).mockResolvedValue(user as any);
    vi.mocked(sessionRepository.create).mockResolvedValue({ id: 'session-1' } as any);

    const result = await authService.login('ana.solano@bancocr.fi.cr', 'SecureBank123!', '127.0.0.1');

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe('ana.solano@bancocr.fi.cr');
    // No debe filtrar campos internos al frontend.
    expect((result.user as any).passwordHash).toBeUndefined();
    expect(userRepository.resetFailedLogins).toHaveBeenCalledWith('user-1');
  });

  it('rechaza con correo inexistente sin revelar que no existe', async () => {
    vi.mocked(userRepository.findByEmailWithAuth).mockResolvedValue(null);

    await expect(authService.login('nadie@x.com', 'algo', '127.0.0.1')).rejects.toThrow(UnauthorizedError);
  });

  it('rechaza contraseña incorrecta e incrementa el contador de intentos', async () => {
    const user = buildUser({ failedLoginAttempts: 1 });
    vi.mocked(userRepository.findByEmailWithAuth).mockResolvedValue(user as any);

    await expect(
      authService.login('ana.solano@bancocr.fi.cr', 'mala-clave', '127.0.0.1'),
    ).rejects.toThrow(UnauthorizedError);

    expect(userRepository.registerFailedLogin).toHaveBeenCalledWith('user-1', 2, null);
  });

  it('HU-14: bloquea la cuenta al llegar al 5to intento fallido', async () => {
    const user = buildUser({ failedLoginAttempts: 4 });
    vi.mocked(userRepository.findByEmailWithAuth).mockResolvedValue(user as any);

    await expect(
      authService.login('ana.solano@bancocr.fi.cr', 'mala-clave', '127.0.0.1'),
    ).rejects.toThrow(LockedError);

    const [, attempts, lockedUntil] = vi.mocked(userRepository.registerFailedLogin).mock.calls[0];
    expect(attempts).toBe(5);
    expect(lockedUntil).toBeInstanceOf(Date);
  });

  it('rechaza login mientras la cuenta sigue bloqueada', async () => {
    const user = buildUser({ lockedUntil: new Date(Date.now() + 10 * 60000) });
    vi.mocked(userRepository.findByEmailWithAuth).mockResolvedValue(user as any);

    await expect(
      authService.login('ana.solano@bancocr.fi.cr', 'SecureBank123!', '127.0.0.1'),
    ).rejects.toThrow(LockedError);
  });

  it('resetea el contador si el bloqueo ya expiró, dando 5 intentos frescos', async () => {
    // Regresión del problema documentado en el código: el reset debe depender solo de que 
    // había un lockedUntil vencido
    const user = buildUser({
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() - 1000), // ya venció
    });
    vi.mocked(userRepository.findByEmailWithAuth).mockResolvedValue(user as any);
    vi.mocked(sessionRepository.create).mockResolvedValue({ id: 'session-1' } as any);

    await authService.login('ana.solano@bancocr.fi.cr', 'SecureBank123!', '127.0.0.1');

    expect(userRepository.resetFailedLogins).toHaveBeenCalledWith('user-1');
  });

  it('rechaza login de usuario inactivo', async () => {
    const user = buildUser({ isActive: false });
    vi.mocked(userRepository.findByEmailWithAuth).mockResolvedValue(user as any);

    await expect(
      authService.login('ana.solano@bancocr.fi.cr', 'SecureBank123!', '127.0.0.1'),
    ).rejects.toThrow('inactiva');
  });
});

describe('authService.confirmPasswordReset (HU-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rechaza token expirado', async () => {
    vi.mocked(passwordResetRepository.findByToken).mockResolvedValue({
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    } as any);

    await expect(authService.confirmPasswordReset('token-x', 'NuevaClave123')).rejects.toThrow(ValidationError);
  });

  it('rechaza token ya usado', async () => {
    vi.mocked(passwordResetRepository.findByToken).mockResolvedValue({
      userId: 'user-1',
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60000),
    } as any);

    await expect(authService.confirmPasswordReset('token-x', 'NuevaClave123')).rejects.toThrow(ValidationError);
  });

  it('rechaza contraseña nueva demasiado corta', async () => {
    vi.mocked(passwordResetRepository.findByToken).mockResolvedValue({
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
    } as any);

    await expect(authService.confirmPasswordReset('token-x', '123')).rejects.toThrow(ValidationError);
  });

  it('acepta token válido, actualiza el hash y revoca sesiones activas', async () => {
    const { sessionRepository } = await import('../repositories/session.repository');
    vi.mocked(passwordResetRepository.findByToken).mockResolvedValue({
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
    } as any);

    await authService.confirmPasswordReset('token-x', 'NuevaClave123');

    expect(userRepository.updatePasswordHash).toHaveBeenCalledWith('user-1', expect.any(String));
    expect(passwordResetRepository.markUsed).toHaveBeenCalledWith('token-x');
    expect(sessionRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });
});
