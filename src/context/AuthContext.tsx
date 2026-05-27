import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loginApi, registerApi } from '../api/authApi';
import { ApiError } from '../api/http';
import {
  clearAuth,
  loadAuth,
  saveAuth,
} from '../storage/authStorage';

type AuthContextValue = {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await loadAuth();
      if (mounted) {
        setToken(saved.token);
        setEmail(saved.email);
        setAuthLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (loginEmail: string, password: string) => {
    setAuthError(null);
    try {
      const result = await loginApi(loginEmail, password);
      await saveAuth(result.token, result.user.email);
      setToken(result.token);
      setEmail(result.user.email);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : '登录失败';
      setAuthError(msg);
      throw e;
    }
  }, []);

  const register = useCallback(
    async (registerEmail: string, password: string) => {
      setAuthError(null);
      try {
        const result = await registerApi(registerEmail, password);
        await saveAuth(result.token, result.user.email);
        setToken(result.token);
        setEmail(result.user.email);
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : '注册失败';
        setAuthError(msg);
        throw e;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearAuth();
    setToken(null);
    setEmail(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      authLoading,
      authError,
      login,
      register,
      logout,
      clearAuthError,
    }),
    [
      token,
      email,
      authLoading,
      authError,
      login,
      register,
      logout,
      clearAuthError,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
