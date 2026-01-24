'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface User {
  name: string;
  email: string;
  role?: Role;
  location?: string;
  phone?: string;
  description?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentRole: Role;
  currentUser: User;
  login: (role: Role, userData: User) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role>('Engineer');
  const [currentUser, setCurrentUser] = useState<User>({ 
    name: 'John Smith', 
    email: 'john.smith@example.com',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    description: 'Senior Manufacturing Engineer with 10 years of experience in automotive and aerospace industries.',
    role: 'Engineer'
  });

  const login = (role: Role, userData: User) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    setCurrentUser(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole('Engineer');
  };

  const setRole = (role: Role) => {
    setCurrentRole(role);
  };

  const updateUser = (userData: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        currentUser,
        login,
        logout,
        setRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
