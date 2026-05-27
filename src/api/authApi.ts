import { apiFetch } from './http';

type AuthResponse = {
  token: string;
  user: { id: number; email: string };
};

export async function registerApi(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    json: { email, password },
  });
}

export async function loginApi(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    json: { email, password },
  });
}
