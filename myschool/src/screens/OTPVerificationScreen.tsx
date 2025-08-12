import { storageService } from '../services/storage';
import { CommonActions } from '@react-navigation/native';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface OTPVerificationScreenProps {
  route: {
    params: {
      userId: number;
      email: string;
      userRole: string;
    };
  };
  navigation: any;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({ route, navigation }) => {
  const { login } = useAuth();
  const { userId, email, userRole } = route.params;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [error, setError] = useState('');
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  console.log('Navigation props:', navigation);
  console.log('clearOtp available?', typeof navigation.clearOtp === 'function');

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      // Verify the OTP
      const response = await apiService.verifyOtp(userId, otpCode);
      
      if (response && response.message && response.access_token) {
        // OTP verification successful - navigate to role-specific login screen
        if (navigation.clearOtp) {
          navigation.clearOtp();
        }
        
        // Navigate to the appropriate login screen based on user role
        if (userRole === 'student') {
          navigation.navigate('student-login');
        } else if (userRole === 'lecturer') {
          navigation.navigate('lecturer-login');
        } else {
          // Fallback to welcome screen if role is unknown
          navigation.navigate('Welcome');
        }
      } else {
        throw new Error(response?.error || 'OTP verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Verification failed. Please try again.';
      setError(errorMessage);
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await apiService.resendOtp(userId);
      if (response && response.message) {
        setTimeLeft(600); // Reset timer
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        Alert.alert('Success', 'A new verification code has been sent to your email.');
      } else {
        throw new Error('Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend code. Please try again.';
      setError(errorMessage);
      console.error('Resend OTP error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>📧 Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to 
          </Text>
          <Text style={[styles.email, {textAlign: 'center', marginBottom: 8}]}>
            {email}
          </Text>
          <Text style={styles.roleText}>Account Type: {userRole}</Text>
        </View>

        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Enter Verification Code</Text>
          <View style={styles.otpInputContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  error ? styles.otpInputError : null,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={handleVerifyOtp}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={resendLoading || timeLeft > 540} // Allow resend after 1 minute
            style={styles.resendButton}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Text style={[
                styles.resendButtonText,
                (timeLeft > 540) && styles.resendButtonDisabled
              ]}>
                {timeLeft > 540 ? `Resend in ${formatTime(600 - timeLeft)}` : 'Resend Code'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Registration</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  otpContainer: {
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  otpInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  timerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  verifyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#9ca3af',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
});

export default OTPVerificationScreen;
