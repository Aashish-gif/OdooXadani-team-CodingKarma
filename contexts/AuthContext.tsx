'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface User {
  id?: string;
  name: string;
  email: string;
  role?: Role;
  location?: string;
  phone?: string;
  description?: string;
  profilePicture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isReady: boolean;
  currentRole: Role;
  currentUser: User;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ec_setu_auth_state';

const defaultUser: User = {
  id: '',
  name: 'John Smith',
  email: 'john.smith@example.com',
  location: 'San Francisco, CA',
  phone: '+1 (555) 123-4567',
  description: 'Senior Manufacturing Engineer with 10 years of experience in automotive and aerospace industries.',
  profilePicture: '',
  role: 'Engineer',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role>('Engineer');
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  // Hydrate auth state from localStorage so refreshes stay logged in
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AuthContextType> & { currentUser?: User; currentRole?: Role };
        if (parsed.isAuthenticated && parsed.currentUser) {
          setIsAuthenticated(true);
          setCurrentUser(parsed.currentUser);
          setCurrentRole(parsed.currentRole || parsed.currentUser.role || 'Engineer');
          
          // Refresh user data from backend if we have a user ID
          if (parsed.currentUser.id) {
            refreshUserData(parsed.currentUser.id);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore auth state, continuing with defaults', error);
    } finally {
      setIsReady(true);
    }
  }, []);

  const persistState = (authState: { isAuthenticated: boolean; user: User; role: Role }) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isAuthenticated: authState.isAuthenticated,
        currentUser: authState.user,
        currentRole: authState.role,
      }),
    );
  };

  const login = async (userData: User) => {
    const nextRole = userData.role || 'Engineer';
    const nextUser = { 
      ...defaultUser, 
      ...userData, 
      id: userData.id || defaultUser.id, // Preserve ID if provided
      role: nextRole 
    };

    setIsAuthenticated(true);
    setCurrentRole(nextRole);
    setCurrentUser(nextUser);
    
    // Fetch fresh user data from backend if we have a user ID
    if (nextUser.id) {
      try {
        const response = await fetch(`/api/profile?id=${nextUser.id}`);
        if (response.ok) {
          const freshUserData = await response.json();
          const updatedUser = { ...nextUser, ...freshUserData };
          setCurrentUser(updatedUser);
          persistState({ isAuthenticated: true, user: updatedUser, role: nextRole });
        } else {
          // If fetch fails, persist the original data
          persistState({ isAuthenticated: true, user: nextUser, role: nextRole });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Persist the original data if fetch fails
        persistState({ isAuthenticated: true, user: nextUser, role: nextRole });
      }
    } else {
      // No ID available, persist the original data
      persistState({ isAuthenticated: true, user: nextUser, role: nextRole });
    }
  };
  
  const refreshUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile?id=${userId}`);
      if (response.ok) {
        const freshUserData = await response.json();
        setCurrentUser(prev => {
          const updated = { ...prev, ...freshUserData };
          persistState({ isAuthenticated: true, user: updated, role: currentRole });
          return updated;
        });
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole('Engineer');
    setCurrentUser(defaultUser);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const setRole = (role: Role) => {
    setCurrentRole(role);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, currentRole: role }));
      }
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      // Update the backend first to ensure data is saved
      if (isAuthenticated && currentUser.id) {
        const updatedData = { ...userData, id: currentUser.id };
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to update user on backend:', errorText);
          throw new Error(`Backend update failed: ${errorText}`);
        }
        
        // If backend update succeeds, update local state
        const updatedCurrentUser = { ...currentUser, ...userData };
        setCurrentUser(updatedCurrentUser);
        persistState({ isAuthenticated, user: updatedCurrentUser, role: updatedCurrentUser.role || currentRole });
      } else {
        // Fallback: update local state only if no user ID
        const updatedCurrentUser = { ...currentUser, ...userData };
        setCurrentUser(updatedCurrentUser);
        persistState({ isAuthenticated, user: updatedCurrentUser, role: updatedCurrentUser.role || currentRole });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-throw to let caller handle the error
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isReady,
        currentRole,
        currentUser,
        login,
        logout,
        setRole,
        updateUser,
        refreshUserData,
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
