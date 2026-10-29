import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, RoleType } from '../types';
import { api } from '../services/api';

/**
 * Interface defining authentication context contract and state handlers.
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  role: RoleType;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication and Session Management Provider.
 * Enforces role-based security (RBAC) and handles Bearer JWT lifecycle.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Fetches authenticated user profile data using current Bearer JWT token.
   */
  const fetchProfile = async () => {
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Session expired or profile fetch error:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Authenticates user credentials against the FastAPI backend (HU-04).
   */
  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(email, pass);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles customer self-registration with automatic login (HU-01).
   */
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      await api.auth.register(userData);
      // Auto-authenticate immediately following successful registration
      await login(userData.email, userData.password);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Terminates active session and clears credentials (HU-05).
   */
  const logout = () => {
    // Notify server asynchronously if possible
    api.auth.logout().catch(() => {});
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  /**
   * Refreshes active user profile data from backend.
   */
  const refreshProfile = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  const role: RoleType = user?.rol || 'VISITANTE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
