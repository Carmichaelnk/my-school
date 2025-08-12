/**
 * MySchool App - Main Application Component
 * Handles authentication state and navigation between screens
 */

import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';

type Screen = 'welcome' | 'student-login' | 'lecturer-login' | 'register' | 'dashboard' | 'otp';

interface OTPParams {
  userId: number;
  email: string;
  userRole: string;
}

// Main App Navigation Component
function AppNavigator(): React.JSX.Element {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [otpParams, setOtpParams] = useState<OTPParams | null>(null);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logoText}>📚</Text>
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
        <Text style={styles.loadingText}>Loading MySchool...</Text>
      </View>
    );
  }

  // If user is authenticated, show dashboard
  if (isAuthenticated && user) {
    return <DashboardScreen />;
  }

  // Show OTP verification screen if OTP is required
  if (otpParams) {
    return (
      <OTPVerificationScreen 
        route={{
          params: {
            userId: otpParams.userId,
            email: otpParams.email,
            userRole: otpParams.userRole
          }
        }}
        navigation={{
          navigate: (screen: string) => {
            if (screen === 'Dashboard') {
              // Will be handled by the auth state change
              setOtpParams(null);
            } else if (screen === 'Welcome') {
              // Navigate back to welcome screen
              setOtpParams(null);
              setCurrentScreen('welcome');
            } else if (screen === 'student-login') {
              // Navigate to student login screen
              setOtpParams(null);
              setCurrentScreen('student-login');
            } else if (screen === 'lecturer-login') {
              // Navigate to lecturer login screen
              setOtpParams(null);
              setCurrentScreen('lecturer-login');
            }
          },
          clearOtp: () => {
            // Clear OTP params and go back to welcome screen
            setOtpParams(null);
            setCurrentScreen('welcome');
          }
        }}
      />
    );
  }

  // Handle navigation between auth screens
  const handleNavigation = {
    toStudentLogin: () => setCurrentScreen('student-login'),
    toLecturerLogin: () => setCurrentScreen('lecturer-login'),
    toRegister: () => setCurrentScreen('register'),
    toWelcome: () => setCurrentScreen('welcome'),
    toOtpVerification: (params: OTPParams) => setOtpParams(params),
    clearOtp: () => setOtpParams(null)
  };

  // Render appropriate screen based on current state
  switch (currentScreen) {
    case 'student-login':
      return (
        <LoginScreen
          userRole="student"
          onNavigateToRegister={handleNavigation.toRegister}
          onNavigateToWelcome={handleNavigation.toWelcome}
        />
      );
    
    case 'lecturer-login':
      return (
        <LoginScreen
          userRole="lecturer"
          onNavigateToRegister={handleNavigation.toRegister}
          onNavigateToWelcome={handleNavigation.toWelcome}
        />
      );
    
    case 'register':
      return (
        <RegisterScreen
          onNavigateToStudentLogin={handleNavigation.toStudentLogin}
          onNavigateToLecturerLogin={handleNavigation.toLecturerLogin}
          onNavigateToWelcome={(otpParams) => {
            if (otpParams) {
              handleNavigation.toOtpVerification(otpParams);
            } else {
              handleNavigation.toWelcome();
            }
          }}
        />
      );
    
    case 'welcome':
    default:
      return (
        <WelcomeScreen
          onNavigateToStudentLogin={handleNavigation.toStudentLogin}
          onNavigateToLecturerLogin={handleNavigation.toLecturerLogin}
          onNavigateToRegister={handleNavigation.toRegister}
        />
      );
  }
}

// Root App Component with Authentication Provider
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  logoText: {
    fontSize: 64,
    marginBottom: 20,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
});

export default App;
