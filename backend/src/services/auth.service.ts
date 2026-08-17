import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { sessionRepository } from '../repositories/session.repository';
import { auditRepository } from '../repositories/audit.repository';
import { passwordResetRepository } from '../repositories/passwordReset.repository';
import { tenantRepository } from '../repositories/tenant.repository';
import { roleRepository } from '../repositories/role.repository';
import { UnauthorizedError, LockedError, ValidationError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export const authService = {
  // HU-02 / HU-14: valida credenciales y bloquea tras 5 intentos fallidos.
  async login(email: string, password: string, ipAddress: string, userAgent?: string) {
    const user = await userRepository.findByEmailWithAuth(email);

    if (!user) {
      // No se revela si un correo existe o no 
      throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new LockedError(`Cuenta bloqueada por intentos fallidos. Volvé a intentar en ${minutesLeft} min.`);
    }

  //Verificador de intentos fallidos y desbloqueo de cuenta si el tiempo de bloqueo ha pasado
    if (user.lockedUntil !== null) {
      await userRepository.resetFailedLogins(user.id);
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60000) : null;
      await userRepository.registerFailedLogin(user.id, attempts, lockedUntil);
      await auditRepository.create({
        id: crypto.randomUUID(),
        userId: user.id,
        action: 'LOGIN',
        result: 'failure',
        ipAddress,
        riskLevel: attempts >= MAX_ATTEMPTS ? 'high' : 'medium',
        tenantId: user.tenantId,
      });
      if (lockedUntil) {
        throw new LockedError(`Cuenta bloqueada por ${LOCK_MINUTES} minutos tras ${MAX_ATTEMPTS} intentos fallidos.`);
      }
      throw new UnauthorizedError(`Correo o contraseña incorrectos. Intentos restantes: ${MAX_ATTEMPTS - attempts}.`);
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Esta cuenta está inactiva. Contactá a tu administrador.');
    }

    await userRepository.resetFailedLogins(user.id);

    const session = await sessionRepository.create(crypto.randomUUID(), user.id, userAgent);

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, roleId: user.roleId, jti: session.id },
      JWT_SECRET,
      { expiresIn: '8h' },
    );

    await auditRepository.create({
      id: crypto.randomUUID(),
      userId: user.id,
      action: 'LOGIN',
      result: 'success',
      ipAddress,
      riskLevel: 'low',
      tenantId: user.tenantId,
    });

    const { passwordHash, mfaEnabled, failedLoginAttempts, lockedUntil, ...publicUser } = user;
    return { token, user: publicUser };
  },

  async logout(sessionId: string, userId: string) {
    await sessionRepository.revoke(sessionId, userId);
  },

  // HU-03: enlace de un solo uso, expira en 30 minutos.
  async requestPasswordReset(email: string): Promise<string | null> {
    const user = await userRepository.findByEmailWithAuth(email);
    if (!user) return null; // no revelamos si el correo existe

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60000);
    await passwordResetRepository.create(token, user.id, expiresAt);
    return token;
  },

  async confirmPasswordReset(token: string, newPassword: string) {
    const record = await passwordResetRepository.findByToken(token);
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new ValidationError('Este enlace ya fue utilizado o expiró. Solicitá uno nuevo.');
    }
    if (newPassword.length < 8) {
      throw new ValidationError('La nueva contraseña debe tener al menos 8 caracteres.');
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePasswordHash(record.userId, hash);
    await passwordResetRepository.markUsed(token);
    await sessionRepository.revokeAllForUser(record.userId);
  },

  // Valida de nuevo la sesión contra la base para que el frontend pueda revalidar
  // el token sin necesidad de que el usuario vuelva a hacer login
  async me(userId: string, tenantId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('Usuario no encontrado.');
    const tenant = await tenantRepository.findById(tenantId);
    const role = await roleRepository.findById(user.roleId);
    return { user, tenant, role };
  },
};
