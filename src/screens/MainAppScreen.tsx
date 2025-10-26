import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigation } from '../components/BottomTabNavigation';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, MessageService } from '../services/MessageService';
import { ProfileService, UserProfile } from '../services/ProfileService';
import { AccountScreen } from './AccountScreen';
import { ChatDetailScreen } from './ChatDetailScreen';
import { ChatListScreen } from './ChatListScreen';
import { ExploreScreen } from './ExploreScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { HotlistScreen } from './HotlistScreen';
import { LoginScreen } from './LoginScreen';
import { OnboardingScreen } from './OnboardingScreen';
import { PhotoManagementScreen } from './PhotoManagementScreen';
import { ProfileCompletionScreen } from './ProfileCompletionScreen';
import { ProfileDetailScreen } from './ProfileDetailScreen';
import { SignOutScreen } from './SignOutScreen';
import { SignUpScreen } from './SignUpScreen';

type Screen = 'profile' | 'photos' | 'explore' | 'hotlist' | 'messages' | 'account' | 'chat-detail' | 'onboarding' | 'signout' | 'login' | 'signup' | 'forgot-password' | 'profile-detail';

export const MainAppScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('explore'); // Default to explore
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // Watch for user authentication changes
  useEffect(() => {
    if (user) {
      console.log('MainAppScreen: User authenticated, redirecting to explore');
      setCurrentScreen('explore');
      loadProfile(); // Reload profile for authenticated user
    } else {
      console.log('MainAppScreen: User not authenticated');
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('MainAppScreen: Loading profile for user:', user?.id);
      const { data, error } = await ProfileService.getCurrentProfile();
      
      if (error) {
        console.error('Failed to load profile:', error);
      } else {
        console.log('MainAppScreen: Profile loaded:', { 
          hasProfile: !!data, 
          gender: data?.gender, 
          seeking: data?.seeking 
        });
        setProfile(data);
        
        // Check if user needs onboarding (missing gender/seeking preferences)
        if (data && (!data.gender || !data.seeking)) {
          console.log('MainAppScreen: User needs onboarding');
          setNeedsOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Profile loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const navigateToProfile = () => setCurrentScreen('profile');
  const navigateToPhotos = () => setCurrentScreen('photos');
  const navigateToExplore = () => setCurrentScreen('explore');
  const navigateToHotlist = () => setCurrentScreen('hotlist');
  const navigateToMessages = () => setCurrentScreen('messages');
  const navigateToAccount = () => setCurrentScreen('account');
  const navigateToSignOut = () => setCurrentScreen('signout');
  const navigateToLogin = () => setCurrentScreen('login');
  const navigateToChatDetail = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setCurrentScreen('chat-detail');
  };
  const navigateToProfileDetail = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setCurrentScreen('profile-detail');
  };
  const navigateToChatFromProfile = async (conversationId: string) => {
    try {
      // Find the conversation by ID
      const { data: conversations } = await MessageService.getConversations();
      const conversation = conversations?.find(conv => conv.id === conversationId);
      
      if (conversation) {
        setSelectedConversation(conversation);
        setCurrentScreen('chat-detail');
      } else {
        console.error('Conversation not found:', conversationId);
        // Fallback to messages screen
        setCurrentScreen('messages');
      }
    } catch (error) {
      console.error('Error navigating to chat:', error);
      // Fallback to messages screen
      setCurrentScreen('messages');
    }
  };
  const navigateBackToMessages = () => {
    setSelectedConversation(null);
    setCurrentScreen('messages');
  };
  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    loadProfile(); // Reload profile to get updated preferences
  };

  // Show onboarding if needed
  if (needsOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Handle signout screen
  if (currentScreen === 'signout') {
    return <SignOutScreen onExplore={navigateToLogin} />;
  }

  // Handle login screen
  if (currentScreen === 'login') {
    return <LoginScreen onNavigateToSignUp={() => setCurrentScreen('signup')} onNavigateToForgotPassword={() => setCurrentScreen('forgot-password')} onNavigateToExplore={() => setCurrentScreen('explore')} />;
  }

  // Handle signup screen
  if (currentScreen === 'signup') {
    return <SignUpScreen onNavigateToLogin={() => setCurrentScreen('login')} />;
  }

  // Handle forgot password screen
  if (currentScreen === 'forgot-password') {
    return <ForgotPasswordScreen onNavigateToLogin={() => setCurrentScreen('login')} />;
  }

  // Handle modal screens (no bottom nav)
  if (currentScreen === 'profile') {
    return <ProfileCompletionScreen onBack={navigateToExplore} />;
  }

  if (currentScreen === 'photos') {
    return <PhotoManagementScreen onBack={navigateToAccount} />;
  }

  if (currentScreen === 'chat-detail' && selectedConversation) {
    return <ChatDetailScreen conversation={selectedConversation} onBack={navigateBackToMessages} />;
  }

  if (currentScreen === 'profile-detail' && selectedProfile) {
    return (
      <ProfileDetailScreen 
        profile={selectedProfile} 
        onBack={() => setCurrentScreen('explore')}
        onNavigateToChat={navigateToChatFromProfile}
      />
    );
  }

  // Main app screens with bottom navigation
  const renderMainContent = () => {
    switch (currentScreen) {
      case 'explore':
        return <ExploreScreen onNavigateToChat={navigateToMessages} onNavigateToLogin={navigateToLogin} onNavigateToProfile={navigateToProfileDetail} />;
      case 'hotlist':
        // Only show hotlist if user is authenticated
        if (!user) {
          return <ExploreScreen onNavigateToChat={navigateToMessages} onNavigateToLogin={navigateToLogin} />;
        }
        return <HotlistScreen onNavigateToChat={navigateToMessages} />;
      case 'messages':
        // Only show messages if user is authenticated
        if (!user) {
          return <ExploreScreen onNavigateToChat={navigateToMessages} onNavigateToLogin={navigateToLogin} />;
        }
        return <ChatListScreen onSelectConversation={navigateToChatDetail} />;
      case 'account':
        // Only show account screen if user is authenticated
        if (!user) {
          return <ExploreScreen onNavigateToChat={navigateToMessages} onNavigateToLogin={navigateToLogin} />;
        }
        return (
          <AccountScreen 
            onNavigateToProfile={navigateToProfile}
            onNavigateToPhotos={navigateToPhotos}
            onSignOut={navigateToSignOut}
          />
        );
      default:
        return <ExploreScreen onNavigateToChat={navigateToMessages} onNavigateToLogin={navigateToLogin} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {renderMainContent()}
      </View>
      
      {/* Bottom Navigation */}
      <BottomTabNavigation 
        activeTab={currentScreen} 
        onTabPress={(tabId) => setCurrentScreen(tabId as Screen)}
        showAccountTab={!!user}
        showHotlistTab={!!user}
        showMessagesTab={!!user}
        showLoginTab={!user}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
  },
});
