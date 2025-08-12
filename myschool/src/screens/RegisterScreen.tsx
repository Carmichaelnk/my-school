/**
 * Registration Screen for MySchool App
 * Handles student registration with institutional email validation
 */

import React, { useState, useEffect, forwardRef } from 'react';
// JSX namespace for TypeScript
import 'react';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import { 
  View, 
  Text, 
  TextInput, 
  TextInputProps,
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Platform,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView
} from 'react-native';

// TypeScript interfaces
interface PasswordInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  helperText?: string;
  editable?: boolean;
}
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface OTPVerificationParams {
  userId: number;
  email: string;
  userRole: string;
}

interface RegisterScreenProps {
  onNavigateToStudentLogin?: () => void;
  onNavigateToLecturerLogin?: () => void;
  onNavigateToWelcome?: (otpParams?: OTPVerificationParams) => void;
  // Add empty navigation prop to satisfy TypeScript
  navigation?: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ 
  navigation, 
  onNavigateToStudentLogin, 
  onNavigateToLecturerLogin,
  onNavigateToWelcome 
}): JSX.Element => {
  type UserRole = 'student' | 'lecturer';

  interface FormData {
    role: UserRole;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }

  const [formData, setFormData] = useState<FormData>({
    role: 'student', // Default role
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { error, clearError } = useAuth();
  
  // Navigation handlers use the callback props directly

  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData]);

  // Helper function to update form data
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateEmail = (email: string, role: UserRole): { isValid: boolean; message: string } => {
    const emailToValidate = email.trim().toLowerCase();
    
    if (!emailToValidate) {
      return { isValid: false, message: 'Email is required' };
    }

    if (role === 'student') {
      const studentEmailPattern = /@students\.kcau\.ac\.ke$/i;
      if (!studentEmailPattern.test(emailToValidate)) {
        return {
          isValid: false, 
          message: 'Please use your student email (@students.kcau.ac.ke)'
        };
      }
    } else if (role === 'lecturer') {
      const lecturerEmailPattern = /@kcau\.ac\.ke$/i;
      if (!lecturerEmailPattern.test(emailToValidate)) {
        return {
          isValid: false, 
          message: 'Please use your institutional email (@kcau.ac.ke)'
        };
      }
    }
    
    return { isValid: true, message: '' };
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const generateUsername = (email: string, role: UserRole): string => {
    // For students, extract admission number from email (e.g., 1902909@students.kcau.ac.ke -> 1902909)
    // For lecturers, use the part before @ in their email
    const username = email.split('@')[0];
    return role === 'student' ? username : username.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const validateForm = (): string | null => {
    const { email, username, password, confirmPassword, first_name, last_name, role } = formData;

    if (!email.trim()) return 'Email is required';
    
    const emailValidation = validateEmail(email, role);
    if (!emailValidation.isValid) return emailValidation.message;
    
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    
    if (!first_name.trim()) return 'First name is required';
    if (!last_name.trim()) return 'Last name is required';
    
    if (!password) return 'Password is required';
    if (!validatePassword(password)) return 'Password must be at least 8 characters';
    
    if (password !== confirmPassword) return 'Passwords do not match';

    return null;
  };

  const handleRegister = async (): Promise<void> => {
    // Clear any previous errors
    clearError();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }
    
    // Auto-generate username from email if not provided
    const usernameToUse = formData.username.trim() || generateUsername(formData.email, formData.role);
    
    if (!formData.username.trim()) {
      setFormData(prev => ({ ...prev, username: usernameToUse }));
    }

    // Prepare registration data
    const registrationData = {
      email: formData.email.trim().toLowerCase(),
      username: usernameToUse.trim().toLowerCase(),
      password: formData.password,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone_number: formData.phone_number.trim() || undefined,
      role: formData.role,
    };

    // Show loading state
    setIsLoading(true);
    
    try {
      // Proceed with registration and OTP flow
      const response = await apiService.register(registrationData) as any;
      
      if (response.otp_required && response.user_id) {
        // Navigate to OTP verification screen
        if (onNavigateToWelcome && typeof onNavigateToWelcome === 'function') {
          // This will trigger the OTP verification flow in App.tsx
          onNavigateToWelcome({
            userId: response.user_id,
            email: formData.email.trim().toLowerCase(),
            userRole: formData.role
          });
        }
      } else if (response.user?.is_verified) {
        // If user is already verified (unlikely but handle it)
        Alert.alert('Registration Successful', 'Your account has been created successfully!');
        // Navigate to appropriate login based on role
        if (formData.role === 'student' && onNavigateToStudentLogin) {
          onNavigateToStudentLogin();
        } else if (onNavigateToLecturerLogin) {
          onNavigateToLecturerLogin();
        }
      } else {
        // Fallback to old flow (shouldn't happen with new backend)
        Alert.alert('Registration Successful', 'Please check your email for verification instructions.');
        // Navigate back to welcome screen
        if (onNavigateToWelcome) {
          onNavigateToWelcome();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (email: string) => {
    const newFormData = { ...formData, email };
    setFormData(newFormData);
    
    // Auto-generate username from email
    if (email.includes('@')) {
      const username = generateUsername(email, formData.role);
      setFormData(prev => ({ ...prev, username }));
    }
  };

  const getEmailError = () => {
    if (formData.email) {
      const validation = validateEmail(formData.email, formData.role);
      if (!validation.isValid) {
        return validation.message;
      }
    }
    return '';
  };

  const getPasswordHelperText = () => {
    if (formData.password && !validatePassword(formData.password)) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  useEffect(() => {
    const email = formData.email.trim();
    
    // Auto-generate username from email if email is valid
    if (email) {
      const validation = validateEmail(email, formData.role);
      if (validation.isValid) {
        const generatedUsername = generateUsername(email, formData.role);
        updateFormData('username', generatedUsername);
      }
    }
  }, [formData.email, formData.role]);

  const getEmailHelperText = () => {
    if (!formData.email) {
      return formData.role === 'student' 
        ? 'Use your student email (e.g., 1902909@students.kcau.ac.ke)'
        : 'Use your institutional email (e.g., johndoe@kcau.ac.ke)';
    }
    
    const validation = validateEmail(formData.email, formData.role);
    if (!validation.isValid) {
      return validation.message || 'Please use a valid institutional email';
    }
    
    return ''; // No helper text when email is valid
  };

  const getEmailInputStyle = () => {
    if (!formData.email) {
      return null; // No error style when field is empty
    }
    
    const validation = validateEmail(formData.email, formData.role);
    if (!validation.isValid) {
      return styles.inputError;
    }
    
    return styles.inputValid; // Add success style when email is valid
  };

  // Custom Password Input Component
  const PasswordInput = forwardRef<TextInput, PasswordInputProps>(({ 
    label, 
    value, 
    onChangeText, 
    showPassword, 
    onTogglePassword, 
    helperText, 
    editable = true, 
    ...props 
  }, ref) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.input, styles.passwordContainer, { backgroundColor: '#ffffff' }]}>
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            style={[styles.passwordInput, !editable && styles.disabledInput]}
            placeholder="••••••••"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="default"
            returnKeyType="done"
            blurOnSubmit={false}
            importantForAutofill="no"
            textContentType="none"
            autoComplete="off"
            contextMenuHidden={true}
            selectionColor="#007AFF"
            underlineColorAndroid="transparent"
            editable={editable}
            {...props}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={onTogglePassword}
            activeOpacity={0.7}
            disabled={!editable}
          >
            <Text style={[styles.showPasswordText, !editable && { opacity: 0.5 }]}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
        {helperText && (
          <Text style={styles.helperText}>
            {helperText}
          </Text>
        )}
      </View>
    );
  });

  // Add display name for the component
  PasswordInput.displayName = 'PasswordInput';

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MySchool with your student email</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {/* Role Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>I am a</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[
                    styles.roleButton, 
                    formData.role === 'student' && styles.roleButtonActive
                  ]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      role: 'student',
                      email: ''
                    }));
                  }}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'student' && styles.roleButtonTextActive
                  ]}>
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.roleButton, 
                    formData.role === 'lecturer' && styles.roleButtonActive
                  ]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      role: 'lecturer',
                      email: ''
                    }));
                  }}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'lecturer' && styles.roleButtonTextActive
                  ]}>
                    Lecturer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {formData.role === 'student' ? 'Student Email' : 'Institutional Email'}
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  getEmailInputStyle()
                ]}
                placeholder={formData.role === 'student' 
                  ? '1902909@students.kcau.ac.ke' 
                  : 'johndoe@kcau.ac.ke'}
                value={formData.email}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                autoComplete="off"
                textContentType="username"
                importantForAutofill="no"
                editable={!isLoading}
              />
              {getEmailHelperText() && (
                <Text style={styles.helperText}>{getEmailHelperText()}</Text>
              )}
            </View>

            {/* Username Display (Read-only) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.username}
                editable={false}
                selectTextOnFocus={false}
                placeholder="Will be generated from your email"
                autoComplete="off"
                importantForAutofill="no"
                textContentType="username"
              />

            </View>

            {/* Name Inputs */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  value={formData.first_name}
                  onChangeText={(text) => updateFormData('first_name', text)}
                  autoCapitalize="words"
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  importantForAutofill="no"
                  textContentType="none"
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  value={formData.last_name}
                  onChangeText={(text) => updateFormData('last_name', text)}
                  autoCapitalize="words"
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  importantForAutofill="no"
                  textContentType="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+254</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="712345678"
                  value={formData.phone_number}
                  onChangeText={(text) => {
                    // Only allow numbers and limit to 9 digits
                    const cleaned = text.replace(/[^0-9]/g, '').substring(0, 9);
                    updateFormData('phone_number', cleaned);
                  }}
                  keyboardType="number-pad"
                  maxLength={9}
                />
              </View>
              <Text style={[styles.helperText, { color: '#6c757d' }]}>
                [Enter 9-digit phone number (e.g., 712345678)]
              </Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <View style={[styles.input, styles.passwordContainer, { backgroundColor: '#ffffff' }]}>
                <TextInput
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  keyboardType="default"
                  returnKeyType="done"
                  blurOnSubmit={false}
                  importantForAutofill="no"
                  autoComplete="off"
                  contextMenuHidden={true}
                  selectionColor="#007AFF"
                  underlineColorAndroid="transparent"
                  editable={!isLoading}
                  // iOS-specific props to disable password suggestions
                  {...(Platform.OS === 'ios' ? {
                    textContentType: 'oneTimeCode' as const,
                    passwordRules: 'required: lower; required: upper; required: digit; max-consecutive: 2; minlength: 8;'
                  } : {})}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={[styles.showPasswordText, isLoading && { opacity: 0.5 }]}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                {getPasswordHelperText()}
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={[styles.input, styles.passwordContainer, { backgroundColor: '#ffffff' }]}>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                  style={[
                    styles.passwordInput,
                    formData.confirmPassword && formData.password !== formData.confirmPassword && styles.inputError
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  keyboardType="default"
                  returnKeyType="done"
                  blurOnSubmit={false}
                  importantForAutofill="no"
                  autoComplete="off"
                  contextMenuHidden={true}
                  selectionColor="#007AFF"
                  underlineColorAndroid="transparent"
                  editable={!isLoading}
                  // iOS-specific props to disable password suggestions
                  {...(Platform.OS === 'ios' ? {
                    textContentType: 'oneTimeCode' as const,
                    passwordRules: 'required: lower; required: upper; required: digit; max-consecutive: 2; minlength: 8;'
                  } : {})}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Text style={[styles.showPasswordText, isLoading && { opacity: 0.5 }]}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                {formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'Passwords do not match'
                  : ' '}
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Footer with login links */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <View style={styles.loginLinks}>
                <TouchableOpacity onPress={() => onNavigateToStudentLogin?.()}>
                  <Text style={[styles.footerLink, styles.studentLink]}>Sign in as Student</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}> or </Text>
                <TouchableOpacity onPress={() => onNavigateToLecturerLogin?.()}>
                  <Text style={[styles.footerLink, styles.lecturerLink]}>Sign in as Lecturer</Text>
                </TouchableOpacity>
              </View>
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
    marginTop: 20,
    marginBottom: 30,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2c3e50',
  },
  passwordInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: 'transparent',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  phonePrefixText: {
    color: '#666',
    fontSize: 16,
  },
  phoneInput: {
    paddingLeft: 70, // Make room for +254 prefix
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  inputValid: {
    borderColor: '#2ecc71',
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
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#ffffff',
    paddingRight: 50, // Make room for show password button
  },
  showPasswordButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  showPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fdf2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  footerLink: {
    fontWeight: '600',
  },
  studentLink: {
    color: '#4a90e2',
  },
  lecturerLink: {
    color: '#4a90e2',
    fontStyle: 'italic',
  },
  loginLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
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

export default RegisterScreen;
