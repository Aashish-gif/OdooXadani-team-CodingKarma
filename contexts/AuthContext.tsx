'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentRole: Role;
  currentUser: User;
  login: (role: Role, userData: User) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role>('Engineer');
  const [currentUser, setCurrentUser] = useState<User>({ 
    name: 'John Smith', 
    email: 'john.smith@example.com' 
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        currentUser,
        login,
        logout,
        setRole,
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
