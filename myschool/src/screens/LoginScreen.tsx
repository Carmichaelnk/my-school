/**
 * Login Screen for MySchool App
 * Handles student authentication with institutional email validation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storage';

interface LoginScreenProps {
  userRole?: 'student' | 'lecturer';
  onNavigateToRegister?: () => void;
  onNavigateToWelcome?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ 
  userRole = 'student',
  onNavigateToRegister, 
  onNavigateToWelcome 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuth();

  // Load remembered email on component mount
  useEffect(() => {
    loadRememberedEmail();
  }, []);

  // Clear error when email or password changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const loadRememberedEmail = async () => {
    try {
      const rememberedEmail = await storageService.getRememberedEmail();
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading remembered email:', error);
    }
  };

  const validateEmail = (email: string): {isValid: boolean, message?: string} => {
    const emailToValidate = email.trim().toLowerCase();
    
    // Check if email is empty
    if (!emailToValidate) {
      return { isValid: false, message: 'Please enter your email address' };
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    // Role-based domain validation
    if (userRole === 'student') {
      const studentEmailPattern = /@students\.kcau\.ac\.ke$/i;
      if (!studentEmailPattern.test(emailToValidate)) {
        return { 
          isValid: false, 
          message: 'Please use your student email (@students.kcau.ac.ke)' 
        };
      }
    } else if (userRole === 'lecturer') {
      const lecturerEmailPattern = /@kcau\.ac\.ke$/i;
      if (!lecturerEmailPattern.test(emailToValidate)) {
        return { 
          isValid: false, 
          message: 'Please use your institutional email (@kcau.ac.ke)' 
        };
      }
    }
    
    return { isValid: true };
  };

  const handleLogin = async () => {
    try {
      // Clear any previous errors
      clearError();

      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        Alert.alert('Invalid Email', emailValidation.message);
        return;
      }

      // Validate password
      if (!password.trim()) {
        Alert.alert('Error', 'Please enter your password');
        return;
      }

      // Attempt login
      await login(email.trim().toLowerCase(), password, rememberMe);
      
      // Login successful - navigation will be handled by App.tsx based on auth state
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const getEmailHelperText = () => {
    if (email && !validateEmail(email)) {
      return 'Use your ' + (userRole === 'student' ? 'student' : 'institutional') + ' email';
    }
    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoText}>📚</Text>
            <Text style={styles.title}>Welcome {userRole === 'student' ? 'Student' : 'Lecturer'}</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to MySchool as a {userRole}
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder={userRole === 'student' ? '1902909@students.kcau.ac.ke' : 'johndoe@kcau.ac.ke'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {getEmailHelperText() && (
                <Text style={styles.helperText}>{getEmailHelperText()}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  keyboardType="default"
                  textContentType="password"
                  importantForAutofill="no"
                  autoComplete="off"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={isLoading}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Remember my email</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={onNavigateToRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerLink}>Register here</Text>
              </TouchableOpacity>
            </View>

            {/* Back to Welcome */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={onNavigateToWelcome}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>← Back to Welcome</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  helperText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    bottom: 16,
    justifyContent: 'center',
  },
  showPasswordText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  errorContainer: {
    backgroundColor: '#fdf2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  registerLink: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default LoginScreen;
