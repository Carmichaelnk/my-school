import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onNavigateToStudentLogin?: () => void;
  onNavigateToLecturerLogin?: () => void;
  onNavigateToRegister?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onNavigateToStudentLogin, 
  onNavigateToLecturerLogin,
  onNavigateToRegister 
}) => {
  const handleGetStarted = () => {
    onNavigateToRegister?.();
  };

  const handleStudentSignIn = () => {
    onNavigateToStudentLogin?.();
  };

  const handleLecturerSignIn = () => {
    onNavigateToLecturerLogin?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>📚</Text>
          </View>
          <Text style={styles.appName}>MySchool</Text>
          <Text style={styles.tagline}>Your Learning Journey Starts Here</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeDescription}>
            Connect with your school community, access your courses, and stay
            updated with all your academic activities in one place.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleStudentSignIn}>
            <Text style={styles.secondaryButtonText}>Sign in as Student</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tertiaryButton} onPress={handleLecturerSignIn}>
            <Text style={styles.tertiaryButtonText}>Sign in as Lecturer</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4a90e2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tertiaryButtonText: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WelcomeScreen;
