import { useState } from 'react';
import { z } from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { apiRequest } from '@/api/client';
import { SilentValidationError } from '@/utils/errors';

const tenantSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  contactEmail: z.string().email('Ingresá un correo válido'),
});

// HU-08 Incorporar nueva entidad bancaria cliente sin afectar a las demás.

export function TenantOnboarding() {
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const { run: submit, loading, error } = useAsyncAction(async () => {
    const result = tenantSchema.safeParse({ name, contactEmail });
    if (!result.success) {
      setFormError(result.error.issues[0].message);
      throw new SilentValidationError();
    }
    setFormError(null);
    await apiRequest('/tenants', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    setCreated(name);
    setName('');
    setContactEmail('');
  }, 'Entidad incorporada correctamente');

  return (
    <div>
      <PageHeader
        title="Nueva entidad cliente"
        huRef="HU-08"
        description="Incorpora una entidad bancaria con su base de datos aislada."
      />

      {created && (
        <div className="card mb-4 border-accent/30 bg-accent-soft">
          <p className="text-sm text-accent font-medium">{created} fue incorporada exitosamente.</p>
        </div>
      )}

      <div className="card max-w-lg space-y-4">
        <div>
          <label htmlFor="tenant-name" className="text-xs text-muted">Nombre de la entidad</label>
          <input
            id="tenant-name"
            className="input mt-1"
            placeholder=""
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tenant-contact-email" className="text-xs text-muted">Correo de contacto administrativo</label>
          <input
            id="tenant-contact-email"
            className="input mt-1"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        {formError && <p className="text-xs text-risk-high">{formError}</p>}
        {error && !formError && <p className="text-xs text-risk-high">{error}</p>}
        <button className="btn-primary" onClick={() => submit()} disabled={loading}>
          {loading ? 'Incorporando...' : 'Incorporar entidad'}
        </button>
      </div>
    </div>
  );
}
