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
      console.log('Checking saved auth state:', saved);
      
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AuthContextType> & { currentUser?: User; currentRole?: Role };
        console.log('Parsed auth state:', parsed);
        
        if (parsed.isAuthenticated && parsed.currentUser) {
          console.log('Restoring authenticated user:', parsed.currentUser);
          setIsAuthenticated(true);
          setCurrentUser(parsed.currentUser);
          setCurrentRole(parsed.currentRole || parsed.currentUser.role || 'Engineer');
          
          // Refresh user data from backend if we have a user ID
          if (parsed.currentUser.id) {
            console.log('Refreshing user data after restore');
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
    console.log('Login called with userData:', userData);
    
    const nextRole = userData.role || 'Engineer';
    const nextUser = { 
      ...defaultUser, 
      ...userData, 
      id: userData.id || defaultUser.id, // Preserve ID if provided
      role: nextRole 
    };

    console.log('Next user data:', nextUser);

    setIsAuthenticated(true);
    setCurrentRole(nextRole);
    setCurrentUser(nextUser);
    
    // Fetch fresh user data from backend if we have a user ID
    if (nextUser.id) {
      console.log('Fetching fresh user data for ID:', nextUser.id);
      try {
        const response = await fetch(`/api/profile?id=${nextUser.id}`);
        console.log('Profile fetch response status:', response.status);
        
        if (response.ok) {
          const freshUserData = await response.json();
          console.log('Fresh user data received:', freshUserData);
          
          const updatedUser = { ...nextUser, ...freshUserData };
          setCurrentUser(updatedUser);
          persistState({ isAuthenticated: true, user: updatedUser, role: nextRole });
        } else {
          console.log('Profile fetch failed, using original data');
          // If fetch fails, persist the original data
          persistState({ isAuthenticated: true, user: nextUser, role: nextRole });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Persist the original data if fetch fails
        persistState({ isAuthenticated: true, user: nextUser, role: nextRole });
      }
    } else {
      console.log('No user ID available, using original data');
      // No ID available, persist the original data
      persistState({ isAuthenticated: true, user: nextUser, role: nextRole });
    }
  };
  
  const refreshUserData = async (userId: string) => {
    try {
      console.log('Refreshing user data for ID:', userId);
      const response = await fetch(`/api/profile?id=${userId}`);
      console.log('Refresh response status:', response.status);
      
      if (response.ok) {
        const freshUserData = await response.json();
        console.log('Refreshed user data:', freshUserData);
        
        setCurrentUser(prev => {
          const updated = { ...prev, ...freshUserData };
          persistState({ isAuthenticated: true, user: updated, role: currentRole });
          return updated;
        });
      } else {
        console.log('Failed to refresh user data');
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
      console.log('Updating user data:', userData);
      console.log('Current user ID:', currentUser.id);
      console.log('Is authenticated:', isAuthenticated);
      
      // Update the backend first to ensure data is saved
      if (isAuthenticated && currentUser.id) {
        const updatedData = { ...userData, id: currentUser.id };
        console.log('Sending update request with data:', updatedData);
        
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });
        
        console.log('Backend response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to update user on backend:', errorText);
          throw new Error(`Backend update failed: ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log('Backend update successful:', responseData);
        
        // If backend update succeeds, update local state
        const updatedCurrentUser = { ...currentUser, ...userData };
        setCurrentUser(updatedCurrentUser);
        persistState({ isAuthenticated, user: updatedCurrentUser, role: updatedCurrentUser.role || currentRole });
      } else {
        console.log('No user ID or not authenticated, updating local state only');
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
