/**
 * Authentication Context for MySchool App
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, User, AuthResponse } from '../services/api';
import { storageService } from '../services/storage';




interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'student' | 'lecturer';
  phone_number?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize authentication state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Get stored tokens
      const accessToken = await storageService.getAccessToken();
      const userData = await storageService.getUserData();

      if (accessToken && userData) {
        // Set token in API service
        apiService.setAccessToken(accessToken);
        
        // Try to get current user to verify token is still valid
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
          
          // Update stored user data if different
          if (JSON.stringify(currentUser) !== JSON.stringify(userData)) {
            await storageService.setUserData(currentUser);
          }
        } catch (error) {
          // Token might be expired, try to refresh
          await attemptTokenRefresh();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const attemptTokenRefresh = async () => {
    try {
      const refreshToken = await storageService.getRefreshToken();
      if (refreshToken) {
        const response = await apiService.refreshToken(refreshToken);
        const newAccessToken = response.access_token;
        
        // Update stored token
        const currentRefreshToken = await storageService.getRefreshToken();
        if (currentRefreshToken) {
          await storageService.setTokens(newAccessToken, currentRefreshToken);
        }
        
        // Set new token in API service
        apiService.setAccessToken(newAccessToken);
        
        // Get current user
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
        await storageService.setUserData(currentUser);
      } else {
        throw new Error('No refresh token available');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await clearAuthData();
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: AuthResponse = await apiService.login({ email, password });
      
      // Store tokens and user data
      await storageService.setTokens(response.access_token, response.refresh_token);
      await storageService.setUserData(response.user);
      
      // Remember email if requested
      if (rememberMe) {
        await storageService.setRememberedEmail(email);
      } else {
        await storageService.clearRememberedEmail();
      }

      // Set token in API service
      apiService.setAccessToken(response.access_token);
      
      // Update state
      setUser(response.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: AuthResponse = await apiService.register(userData);
      
      // Store tokens and user data
      await storageService.setTokens(response.access_token, response.refresh_token);
      await storageService.setUserData(response.user);

      // Set token in API service
      apiService.setAccessToken(response.access_token);
      
      // Update state
      setUser(response.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await clearAuthData();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    await attemptTokenRefresh();
  };

  const clearAuthData = async () => {
    // Clear stored data
    await storageService.clearAll();
    
    // Clear API service token
    apiService.clearAccessToken();
    
    // Clear state
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
