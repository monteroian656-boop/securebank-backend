import { useState } from 'react';
import { z } from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { apiRequest } from '@/api/client';
import { toUserMessage } from '@/api/errorMessage';

const emailSchema = z.string().email('Ingresá un correo válido');

interface RequestResetResponse {
  sent: boolean;
  devToken?: string;
}

// HU-03 Restablecimiento de contraseña vía verificación por correo, el backend genera un token real de un solo uso que expira en 30 min
// se envía por correo; en desarrollo el backend lo devuelve como devToken para poder probar el flujo sin un correo configurado
export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    try {
      const res = await apiRequest<RequestResetResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setDevToken(res.devToken ?? null);
      setSent(true);
    } catch (err) {
      setError(toUserMessage(err));
    }
  };

  const handleConfirm = async (token: string) => {
    if (newPassword.length < 8) {
      setConfirmError('Ingresá una nueva contraseña de al menos 8 caracteres.');
      return;
    }
    setConfirming(true);
    setConfirmError(null);
    try {
      await apiRequest('/auth/reset-password/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      setConfirmed(true);
    } catch (err) {
      setConfirmError(toUserMessage(err));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <PageHeader
        title="Restablecer contraseña"
        huRef="HU-03"
        description="Envía un enlace de un solo uso al correo registrado."
      />

      {!sent && (
        <div className="card space-y-4">
          <div>
            <label htmlFor="reset-email" className="sr-only">Correo</label>
            <input
              id="reset-email"
              className="input"
              type="email"
              placeholder="usuario@entidad.fi.cr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-xs text-risk-high mt-1">{error}</p>}
          </div>
          <button className="btn-primary w-full" onClick={handleSubmit}>
            Enviar enlace
          </button>
        </div>
      )}

      {sent && !confirmed && (
        <div className="card space-y-3">
          <p className="text-sm font-medium">Revisá tu correo</p>
          <p className="text-sm text-muted">
            Si {email} está registrado, vas a recibir un enlace para restablecer tu contraseña.
            El enlace expira en 30 minutos y solo puede usarse una vez.
          </p>

          {devToken && (
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs text-muted">
                Modo desarrollo — no hay servidor de correo, así que el backend devolvió el
                enlace acá directamente:
              </p>
              <input
                className="input text-xs"
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                className="btn-secondary !py-1.5 !px-3 text-xs"
                disabled={confirming}
                onClick={() => handleConfirm(devToken)}
              >
                Usar este enlace
              </button>
              <button
                className="btn-secondary !py-1.5 !px-3 text-xs ml-2"
                disabled={confirming}
                onClick={() => handleConfirm('token-invalido-demo')}
              >
                Simular enlace vencido/usado
              </button>
              {confirming && <p className="text-xs text-muted">Verificando enlace...</p>}
              {confirmError && <p className="text-xs text-risk-high">{confirmError}</p>}
            </div>
          )}
        </div>
      )}

      {confirmed && (
        <div className="card">
          <p className="text-sm font-medium text-accent mb-1">Contraseña restablecida</p>
          <p className="text-sm text-muted">
            Tus sesiones activas anteriores fueron cerradas. Iniciá sesión con tu nueva contraseña.
          </p>
        </div>
      )}
    </div>
  );
}
