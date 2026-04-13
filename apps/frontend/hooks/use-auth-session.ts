'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  clearAuthSession,
  fetchCurrentUser,
  loadStoredAuthSession,
  saveAuthSession,
  type AuthSession,
} from '@/services/auth/auth.service';

export function useAuthSession() {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((nextSession: AuthSession | null) => {
    if (nextSession) {
      saveAuthSession(nextSession);
    } else {
      clearAuthSession();
    }

    setSessionState(nextSession);
  }, []);

  const refreshSession = useCallback(async () => {
    const storedSession = loadStoredAuthSession();

    if (!storedSession?.token) {
      setSessionState(null);
      setIsLoading(false);
      return null;
    }

    try {
      const user = await fetchCurrentUser(storedSession.token);
      const nextSession = {
        token: storedSession.token,
        user,
      } satisfies AuthSession;

      saveAuthSession(nextSession);
      setSessionState(nextSession);
      return nextSession;
    } catch {
      clearAuthSession();
      setSessionState(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setSessionState(null);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  return {
    session,
    isLoading,
    isAuthenticated: Boolean(session?.token),
    setSession,
    logout,
    refreshSession,
  };
}
