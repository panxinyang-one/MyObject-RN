import { getApiBaseUrl } from '../config/api';
import { getToken } from '../storage/authStorage';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const base = await getApiBaseUrl();
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  let body = options.body;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
    body,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: { message?: string; error?: string } | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message ?? data?.error ?? `HTTP ${res.status}`,
    );
  }

  return (data ?? {}) as T;
}
