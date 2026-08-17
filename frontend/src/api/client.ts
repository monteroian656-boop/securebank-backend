import type { ApiResponse } from '@/types/shared';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

// Manejador central del envelope
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('sb_token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = (await res.json()) as ApiResponse<T>;

  if (!body.success) {
    throw new ApiClientError(body.error.code, body.error.message);
  }

  return body.data;
}

export class ApiClientError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
