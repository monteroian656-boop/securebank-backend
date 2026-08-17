import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/api/client';
import { toUserMessage } from '@/api/errorMessage';

const credentialsSchema = z.object({
  email: z.string().email('Ingresá un correo válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

interface LoginResponse {
  token: string;
}

// HU-02 Autenticación multifactor / HU-14 Bloqueo tras 5 intentos fallidos.
//
// El paso de credenciales (email+contraseña) valida contra el backend incluido el bloqueo por intentos fallidos (HU-14)
// El segundo factor (código MFA) queda como un paso extra no implementado en el backend, solo de UI, para poder mostrar el flujo completo de login con MFA
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);

  const handleContinue = async () => {
    const result = credentialsSchema.safeParse({ email, password });
    if (!result.success) {
      setCredentialsError(result.error.issues[0].message);
      return;
    }
    setCredentialsError(null);
    setSubmitting(true);
    try {
      const { token } = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setPendingToken(token);
      setStep('mfa');
    } catch (err) {
      setCredentialsError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!pendingToken) return;
    if (mfaCode !== '123456') {
      setMfaError('Código incorrecto. Probá con 123456 (demo).');
      return;
    }
    setMfaError(null);
    try {
      await login(pendingToken);
      navigate('/dashboard/sla');
    } catch (err) {
      setMfaError(toUserMessage(err));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action();
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <PageHeader
        title="Iniciar sesión"
        huRef="HU-02 · HU-14"
        description="Login con segundo factor y bloqueo automático tras intentos fallidos."
      />
      <div className="card space-y-4">
        {step === 'credentials' ? (
          <>
            <div>
              <label htmlFor="login-email" className="text-xs text-muted">Correo</label>
              <input
                id="login-email"
                className="input mt-1"
                type="email"
                placeholder="usuario@entidad.fi.cr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleContinue)}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="text-xs text-muted">Contraseña</label>
              <input
                id="login-password"
                className="input mt-1"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleContinue)}
              />
            </div>
            {credentialsError && <p className="text-xs text-risk-high">{credentialsError}</p>}
            <button className="btn-primary w-full" onClick={handleContinue} disabled={submitting}>
              {submitting ? 'Verificando...' : 'Continuar'}
            </button>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="mfa-code" className="text-xs text-muted">Código de verificación (MFA)</label>
              <input
                id="mfa-code"
                className="input mt-1 font-mono"
                maxLength={6}
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleVerify)}
              />
              {mfaError && <p className="text-xs text-risk-high mt-1">{mfaError}</p>}
              <p className="text-xs text-muted mt-1">Demo: el código válido es 123456</p>
            </div>
            <button className="btn-primary w-full" onClick={handleVerify}>
              Verificar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
