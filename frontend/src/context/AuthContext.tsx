import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiRequest, ApiClientError } from '@/api/client';
import type { Role, Tenant, User } from '@/types/shared';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tenant: Tenant | null;
  role: Role | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface MeResponse {
  user: User;
  tenant: Tenant | null;
  role: Role;
}

// Sesión por entidad bancaria, solo el token vive en localStorage; usuario/entidad/rol SIEMPRE se leen del
// backend vía GET /api/auth/me, nunca se guardan en localStorage
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [hydrating, setHydrating] = useState(true);

  const fetchMe = async () => {
    const me = await apiRequest<MeResponse>('/auth/me');
    setUser(me.user);
    setTenant(me.tenant);
    setRole(me.role);
  };

  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    if (!token) {
      setHydrating(false);
      return;
    }
    fetchMe()
      .catch((err) => {
        if (err instanceof ApiClientError) localStorage.removeItem('sb_token');
      })
      .finally(() => setHydrating(false));
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('sb_token', token);
    await fetchMe();
  };

  const logout = () => {
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {
      // Si el backend no responde igual limpiamos la sesión localmente.
    });
    localStorage.removeItem('sb_token');
    setUser(null);
    setTenant(null);
    setRole(null);
  };

  const hasPermission = (permission: string) => !!role?.permissions.includes(permission);

  if (hydrating) return null;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, tenant, role, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
