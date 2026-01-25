'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Role = 'Engineer' | 'ECO Manager' | 'Operations' | 'Admin';

interface User {
  id?: string;
  name: string;
  email: string;
  role?: Role;
  location?: string;
  phone?: string;
  description?: string;
  profilePicture?: string;
  accessToken?: string;
  refreshToken?: string;
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
          
          // Restore JWT tokens if available
          if (parsed.currentUser.accessToken) {
            localStorage.setItem('accessToken', parsed.currentUser.accessToken);
          }
          if (parsed.currentUser.refreshToken) {
            localStorage.setItem('refreshToken', parsed.currentUser.refreshToken);
          }
          
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
    
    // Include JWT tokens in the stored user object
    const userWithTokens = {
      ...authState.user,
      accessToken: localStorage.getItem('accessToken') || undefined,
      refreshToken: localStorage.getItem('refreshToken') || undefined,
    };
    
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isAuthenticated: authState.isAuthenticated,
        currentUser: userWithTokens,
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
    
    // Store JWT tokens in localStorage
    if (userData.accessToken) {
      localStorage.setItem('accessToken', userData.accessToken);
    }
    if (userData.refreshToken) {
      localStorage.setItem('refreshToken', userData.refreshToken);
    }
    
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
          
          // Use role from fresh data if available
          const finalRole = (freshUserData.role as Role) || nextRole;
          if (freshUserData.role && freshUserData.role !== nextRole) {
              setCurrentRole(finalRole);
          }
          
          setCurrentUser(updatedUser);
          persistState({ isAuthenticated: true, user: updatedUser, role: finalRole });
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
      
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/profile', {
        headers: {
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
      });
      
      console.log('Refresh response status:', response.status);
      
      if (response.ok) {
        const freshUserData = await response.json();
        console.log('Refreshed user data:', freshUserData);
        
        // Update role if it exists in the fresh data
        const freshRole = (freshUserData.role as Role) || currentRole;
        if (freshUserData.role && freshUserData.role !== currentRole) {
          setCurrentRole(freshRole);
        }

        setCurrentUser(prev => {
          const updated = { ...prev, ...freshUserData };
          persistState({ isAuthenticated: true, user: updated, role: freshRole });
          return updated;
        });
      } else {
        console.log('Failed to refresh user data');
        
        // If unauthorized, try to refresh the token
        if (response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Retry the request with the new token
            const retryResponse = await fetch('/api/profile', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
            });
            
            if (retryResponse.ok) {
              const retryFreshUserData = await retryResponse.json();
              console.log('Retry refreshed user data:', retryFreshUserData);
              
              // Update role if it exists in the fresh data
              const freshRole = (retryFreshUserData.role as Role) || currentRole;
              if (retryFreshUserData.role && retryFreshUserData.role !== currentRole) {
                setCurrentRole(freshRole);
              }

              setCurrentUser(prev => {
                const updated = { ...prev, ...retryFreshUserData };
                persistState({ isAuthenticated: true, user: updated, role: freshRole });
                return updated;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const logout = async () => {
    // Call the logout API to revoke the refresh token
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const userId = currentUser.id;
      
      if (refreshToken && userId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
      }
    } catch (error) {
      console.error('Error revoking refresh token:', error);
    }
    
    setIsAuthenticated(false);
    setCurrentRole('Engineer');
    setCurrentUser(defaultUser);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
      
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      
      // Update the backend first to ensure data is saved
      if (isAuthenticated && currentUser.id) {
        const updatedData = { ...userData, id: currentUser.id };
        console.log('Sending update request with data:', updatedData);
        
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          },
          body: JSON.stringify(updatedData),
        });
        
        console.log('Backend response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to update user on backend:', errorText);
          
          // If unauthorized, try to refresh the token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              // Retry the request with the new token
              const retryResponse = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(updatedData),
              });
              
              if (!retryResponse.ok) {
                const retryErrorText = await retryResponse.text();
                throw new Error(`Retry failed: ${retryErrorText}`);
              }
              
              const retryResponseData = await retryResponse.json();
              console.log('Retry update successful:', retryResponseData);
              
              // If backend update succeeds, update local state
              const updatedCurrentUser = { ...currentUser, ...userData };
              setCurrentUser(updatedCurrentUser);
              persistState({ isAuthenticated, user: updatedCurrentUser, role: updatedCurrentUser.role || currentRole });
              return;
            }
          }
          
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
  
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.error('No refresh token available');
        return false;
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token refresh failed:', errorData);
        return false;
      }
      
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      
      // Update current user with new token info
      setCurrentUser(prev => ({
        ...prev,
        accessToken: data.accessToken,
      }));
      
      console.log('Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
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
