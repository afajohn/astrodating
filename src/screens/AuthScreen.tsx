import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { LoginScreen } from './LoginScreen';
import { SignOutScreen } from './SignOutScreen';
import { SignUpScreen } from './SignUpScreen';

type AuthScreen = 'login' | 'signup' | 'forgot-password' | 'signout';

export const AuthScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('signout'); // Start with signout screen

  const navigateToLogin = () => setCurrentScreen('login');
  const navigateToSignUp = () => setCurrentScreen('signup');
  const navigateToForgotPassword = () => setCurrentScreen('forgot-password');

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'signout':
        return <SignOutScreen onExplore={() => {
          // Always go to login when "Explore Your Match" is clicked
          navigateToLogin();
        }} />;
      case 'login':
        return (
          <LoginScreen
            onNavigateToSignUp={navigateToSignUp}
            onNavigateToForgotPassword={navigateToForgotPassword}
          />
        );
      case 'signup':
        return <SignUpScreen onNavigateToLogin={navigateToLogin} />;
      case 'forgot-password':
        return <ForgotPasswordScreen onNavigateToLogin={navigateToLogin} />;
      default:
        return <SignOutScreen onExplore={() => {
          // Always go to login when "Explore Your Match" is clicked
          navigateToLogin();
        }} />;
    }
  };

  return <SafeAreaView style={styles.container}>{renderCurrentScreen()}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
