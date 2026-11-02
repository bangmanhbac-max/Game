import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { loginUser, registerUser, getCurrentUser, updateProfile as apiUpdateProfile } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (creds: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { full_name?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('eduplay_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('eduplay_token');
    if (savedToken) {
      getCurrentUser(savedToken)
        .then((userData) => {
          setUser(userData);
          setToken(savedToken);
        })
        .catch(() => {
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('eduplay_token');
          setUser(null);
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (creds: LoginCredentials) => {
    const authRes = await loginUser(creds);
    localStorage.setItem('eduplay_token', authRes.access_token);
    setToken(authRes.access_token);
    setUser(authRes.user);
  };

  const register = async (data: RegisterData) => {
    const authRes = await registerUser(data);
    localStorage.setItem('eduplay_token', authRes.access_token);
    setToken(authRes.access_token);
    setUser(authRes.user);
  };

  const logout = () => {
    localStorage.removeItem('eduplay_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { full_name?: string; avatar?: string }) => {
    const updated = await apiUpdateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
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
