import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, decodeToken, getStoredToken, persistToken } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => decodeToken(getStoredToken()));

  function setSession(token) {
    persistToken(token);
    setUser(decodeToken(token));
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  useEffect(() => {
    function onExpired() {
      setUser(null);
    }
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setSession,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
