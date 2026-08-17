import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

// Oculta un elemento de UI (botón, sección) si el rol activo no tiene
// el permiso indicado. Ej: un Auditor (solo 'audit:read') no debe ver
// "Nuevo rol" ni "Incorporar entidad" (requieren 'roles:write'/'users:write').
export function RoleGate({ requires, children }: { requires: string; children: ReactNode }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(requires)) return null;
  return <>{children}</>;
}
