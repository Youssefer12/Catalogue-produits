/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
const USER_STORAGE_KEY = 'catalogue_user_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [user]);

  const login = (username) => {
    const cleanName = String(username || '').trim();
    if (!cleanName) return null;

    const role = cleanName.toLowerCase() === 'admin' ? 'admin' : 'client';
    const nextUser = { username: cleanName, role };
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
