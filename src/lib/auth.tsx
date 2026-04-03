import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, getCurrentUser, setCurrentUser, authenticateUser, addUser as storeAddUser, updateUser } from './store';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => User;
  signup: (name: string, email: string, password: string) => User;
  logout: () => void;
  refreshUser: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  const refreshUser = useCallback(() => {
    const fresh = getCurrentUser();
    setUser(fresh);
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshUser, 3000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  const login = useCallback((email: string, password: string) => {
    const u = authenticateUser(email, password);
    if (!u) throw new Error('Invalid email or password');
    setCurrentUser(u);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback((name: string, email: string, password: string) => {
    const u = storeAddUser({ name, email, password });
    setCurrentUser(u);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated = updateUser(user.id, updates);
    setCurrentUser(updated);
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
