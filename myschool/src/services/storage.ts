/**
 * Storage Service for MySchool App
 * Handles secure storage of authentication tokens and user data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@myschool_access_token',
  REFRESH_TOKEN: '@myschool_refresh_token',
  USER_DATA: '@myschool_user_data',
  REMEMBER_EMAIL: '@myschool_remember_email',
} as const;

export class StorageService {
  // Token management
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  }

  // User data management
  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  // Remember email functionality
  async setRememberedEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email);
    } catch (error) {
      console.error('Error storing remembered email:', error);
      throw error;
    }
  }

  async getRememberedEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL);
    } catch (error) {
      console.error('Error getting remembered email:', error);
      return null;
    }
  }

  async clearRememberedEmail(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
    } catch (error) {
      console.error('Error clearing remembered email:', error);
      throw error;
    }
  }

  // Clear all stored data
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.clearTokens(),
        this.clearUserData(),
        this.clearRememberedEmail(),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
