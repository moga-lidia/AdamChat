import { createContext, useContext, useEffect, useState, useCallback, type PropsWithChildren } from 'react';
import type { AuthUser } from '@/types/auth';
import { loadAuthUser, saveAuthUser, clearAuthUser } from '@/services/auth-storage';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadAuthUser();
      if (stored) setUser(stored);
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (authUser: AuthUser) => {
    setUser(authUser);
    await saveAuthUser(authUser);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await clearAuthUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
