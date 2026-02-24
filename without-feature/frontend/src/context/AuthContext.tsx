import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem('pulseboard_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.user);
    } catch {
      localStorage.removeItem('pulseboard_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('pulseboard_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('pulseboard_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
