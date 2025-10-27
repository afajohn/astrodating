import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { DailyQuoteModalCard } from '../components/DailyQuoteModalCard';
import { useAuth } from '../contexts/AuthContext';
import { AstrologyService } from '../services/AstrologyService';
import { CompatibilityService } from '../services/CompatibilityService';
import { ProfileService, UserProfile } from '../services/ProfileService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.7;

interface ExploreScreenProps {
  onNavigateToChat?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToProfile?: (profile: UserProfile) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onNavigateToChat, onNavigateToLogin, onNavigateToProfile }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [browseCount, setBrowseCount] = useState(0);
  const [maxBrowseLimit, setMaxBrowseLimit] = useState(5);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showDailyQuote, setShowDailyQuote] = useState(false);

  useEffect(() => {
    loadProfiles();
    loadCurrentUserProfile();
    checkBrowseLimits();
    checkAndShowDailyQuote();
  }, [user]); // Add user to dependencies

  const checkAndShowDailyQuote = async () => {
    if (!user) {
      console.log('No user logged in, skipping daily quote');
      return;
    }
    
    // DISABLED AUTO-SHOW - User will tap button to open modal
    console.log('Daily quote modal disabled - user must tap button to open');
    setShowDailyQuote(false);
    
    try {
      // TEMPORARILY DISABLED - Will re-enable after testing
      /*
      const lastShownDate = await AsyncStorage.getItem('lastDailyQuoteShown');
      const today = new Date().toISOString().split('T')[0];
      
      console.log('CheckAndShowDailyQuote:', { lastShownDate, today });
      
      if (!lastShownDate || lastShownDate !== today) {
        console.log('Showing daily quote modal');
        setShowDailyQuote(true);
        await AsyncStorage.setItem('lastDailyQuoteShown', today);
      } else {
        console.log('Daily quote already shown today');
      }
      */
    } catch (error) {
      console.error('Error checking daily quote:', error);
      setShowDailyQuote(false);
    }
  };

  const loadProfiles = async () => {
    try {
      setLoading(true);
      console.log('ExploreScreen: Loading profiles...');
      const { data, error } = await ProfileService.getExploreProfiles();
      
      console.log('ExploreScreen: Profiles loaded:', { 
        count: data?.length, 
        error: error?.message 
      });
      
      if (error) {
        console.error('ExploreScreen: Error loading profiles:', error);
        // Check if it's a "no profile found" error
        if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
          console.log('ExploreScreen: No profile found for current user - staying on explore screen');
          // Don't show alert, just stay on explore screen
          setProfiles([]);
          return;
        }
        Alert.alert('Error', 'Failed to load profiles');
        return;
      }
      
      setProfiles(data || []);
    } catch (error) {
      console.error('ExploreScreen: Exception loading profiles:', error);
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserProfile = async () => {
    try {
      if (user) {
        console.log('ExploreScreen: Loading current user profile for user:', user.id);
        const { data, error } = await ProfileService.getCurrentProfile();
        
        // If no profile found, stay on explore screen
        if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
          console.log('ExploreScreen: No profile found for current user - allowing explore access');
          setCurrentUserProfile(null);
          return;
        }
        
        console.log('ExploreScreen: Current user profile loaded:', {
          hasProfile: !!data,
          birth_date: data?.birth_date,
          western_sign: data?.western_sign,
          chinese_sign: data?.chinese_sign,
          vedic_sign: data?.vedic_sign,
        });
        setCurrentUserProfile(data);
      }
    } catch (error) {
      console.error('Failed to load current user profile:', error);
      // Even if there's an error, stay on explore screen
      setCurrentUserProfile(null);
    }
  };

  const checkBrowseLimits = async () => {
    try {
      const { data: profile, error } = await ProfileService.getCurrentProfile();
      
      // If no profile found, allow browsing with limited access
      if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
        console.log('ExploreScreen: No profile - allowing limited browse access');
        setBrowseCount(0);
        setMaxBrowseLimit(5); // Limited access for users without profile
        setIsProfileComplete(false);
        return;
      }
      
      if (profile) {
        // Check if we need to reset the daily browse count
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const lastResetDate = profile.last_browse_reset_date || '';
        
        // If it's a new day, reset the browse count
        if (today !== lastResetDate && lastResetDate !== '') {
          console.log('ExploreScreen: Resetting browse count for new day');
          await ProfileService.updateBrowseCount(0);
          // Reload profile to get updated count
          const { data: updatedProfile } = await ProfileService.getCurrentProfile();
          if (updatedProfile) {
            setBrowseCount(0);
          }
        } else {
          setBrowseCount(profile.profiles_browsed_today || 0);
        }
        
        // Use a more reasonable completion check
        const hasBasicInfo = profile.first_name && profile.last_name && profile.birth_date && 
                           profile.country && profile.gender && profile.seeking && profile.bio;
        setIsProfileComplete(!!hasBasicInfo);
        setMaxBrowseLimit(hasBasicInfo ? Infinity : 5);
      }
    } catch (error) {
      console.error('Failed to check browse limits:', error);
      // Allow limited access on error
      setBrowseCount(0);
      setMaxBrowseLimit(5);
      setIsProfileComplete(false);
    }
  };

  const calculateCompatibility = (profile: UserProfile) => {
    if (!user?.id || !currentUserProfile) {
      console.log('Compatibility: Missing user or currentUserProfile', { 
        hasUser: !!user?.id, 
        hasCurrentProfile: !!currentUserProfile 
      });
      return { score: 0, breakdown: {} };
    }
    
    console.log('Compatibility: Calculating between profiles', {
      currentUser: {
        id: currentUserProfile.id,
        birth_date: currentUserProfile.birth_date,
        western_sign: currentUserProfile.western_sign,
        chinese_sign: currentUserProfile.chinese_sign,
        vedic_sign: currentUserProfile.vedic_sign,
      },
      targetProfile: {
        id: profile.id,
        birth_date: profile.birth_date,
        western_sign: profile.western_sign,
        chinese_sign: profile.chinese_sign,
        vedic_sign: profile.vedic_sign,
      }
    });
    
    const result = CompatibilityService.calculateCompatibility(currentUserProfile, profile);
    console.log('Compatibility: Result', result);
    
    return result;
  };

  const handleSwipeRight = async (profile: UserProfile) => {
    try {
      // Add to hotlist
      await ProfileService.addToHotlist(profile.id);
      Alert.alert('Added to Hotlist', `${profile.first_name} has been added to your hotlist!`);
      
      // Move to next card
      setCurrentIndex(prev => prev + 1);
      incrementBrowseCount();
    } catch (error) {
      Alert.alert('Error', 'Failed to add to hotlist');
    }
  };

  const handleSwipeLeft = () => {
    // Just move to next card (pass)
    setCurrentIndex(prev => prev + 1);
    incrementBrowseCount();
  };

  const incrementBrowseCount = async () => {
    try {
      const newCount = browseCount + 1;
      setBrowseCount(newCount);
      
      // Update browse count in database
      await ProfileService.updateBrowseCount(newCount);
      
      // Check if limit reached
      if (!isProfileComplete && newCount >= maxBrowseLimit) {
        if (!user) {
          // User is not logged in - show login prompt
          Alert.alert(
            'Browse Limit Reached',
            'You\'ve reached your daily limit of 5 profiles. Sign in to browse unlimited profiles and find your cosmic match!',
            [
              { text: 'Continue Browsing', style: 'cancel' },
              { 
                text: 'Sign In', 
                onPress: () => onNavigateToLogin?.() 
              }
            ]
          );
        } else {
          // User is logged in but profile incomplete
          Alert.alert(
            'Browse Limit Reached',
            'You\'ve reached your daily limit of 5 profiles. Complete your profile to browse unlimited profiles!'
          );
        }
      }
    } catch (error) {
      console.error('Failed to update browse count:', error);
    }
  };

  const handleSendMessage = async (profile: UserProfile) => {
    const compatibility = calculateCompatibility(profile);
    
    if (compatibility.score >= 2) {
      Alert.alert(
        'Send Message', 
        `Send a message to ${profile.first_name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Send Message', 
            onPress: () => {
              // Navigate to profile detail screen where user can compose message
              onNavigateToProfile?.(profile);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Compatibility Required',
        'You need at least 2/3 compatibility to send a message.'
      );
    }
  };

  const renderProfileCard = (profile: UserProfile, index: number) => {
    const compatibility = calculateCompatibility(profile);
    const isCurrentCard = index === currentIndex;
    
    if (index < currentIndex) return null; // Hide swiped cards
    
    // Calculate initials
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    
    // Calculate compatibility percentage
    const compatibilityPercentage = Math.round((compatibility.score / 3) * 100);
    
    return (
      <TouchableOpacity
        key={profile.id}
        style={[
          styles.card,
          { zIndex: profiles.length - index }
        ]}
        onPress={() => onNavigateToProfile?.(profile)}
        activeOpacity={0.9}
      >
        {/* Compatibility Percentage Badge */}
        <View style={[
          styles.compatibilityBadge,
          { backgroundColor: compatibility.score >= 2 ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.compatibilityText}>
            {compatibilityPercentage}%
          </Text>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          {profile.profile_photo ? (
            <Image source={{ uri: profile.profile_photo }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          {/* Name */}
          <Text style={styles.name}>
            {profile.first_name} {profile.last_name?.charAt(0)}.
          </Text>
          
          {/* Age - Country */}
          <Text style={styles.ageCountry}>
            {profile.age || 'Age not specified'} • {profile.country || 'Location not specified'}
          </Text>
          
          {/* Astrology Signs */}
          <View style={styles.astrologyContainer}>
            <View style={styles.signItem}>
              <Text style={styles.signLabel}>Western</Text>
              <Text style={styles.signValue}>
                {(() => {
                  if (!profile.birth_date) return 'N/A';
                  const astrology = AstrologyService.getAstrologyProfile(profile.birth_date);
                  return astrology.westernSign;
                })()}
              </Text>
            </View>
            <View style={styles.signItem}>
              <Text style={styles.signLabel}>Chinese</Text>
              <Text style={styles.signValue}>
                {(() => {
                  if (!profile.birth_date) return 'N/A';
                  const astrology = AstrologyService.getAstrologyProfile(profile.birth_date);
                  return astrology.chineseSign;
                })()}
              </Text>
            </View>
            <View style={styles.signItem}>
              <Text style={styles.signLabel}>Vedic</Text>
              <Text style={styles.signValue}>
                {(() => {
                  if (!profile.birth_date) return 'N/A';
                  const astrology = AstrologyService.getAstrologyProfile(profile.birth_date);
                  return astrology.vedicSign;
                })()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => handleSwipeLeft()}
          >
            <Text style={styles.passButtonText}>✕</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.hotlistButton]}
            onPress={() => handleSwipeRight(profile)}
          >
            <Text style={styles.hotlistButtonText}>♥</Text>
          </TouchableOpacity>
          
          {compatibility.score >= 2 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.messageButton]}
              onPress={() => handleSendMessage(profile)}
            >
              <Text style={styles.messageButtonText}>💬</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Finding your cosmic matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profiles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Daily Quote Modal - Add to empty state too */}
        <DailyQuoteModalCard 
          visible={showDailyQuote} 
          onClose={() => setShowDailyQuote(false)} 
        />
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No More Profiles</Text>
          <Text style={styles.emptyText}>
            You've seen all available profiles! Check back later for new cosmic connections.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Daily Quote Modal */}
      <DailyQuoteModalCard 
        visible={showDailyQuote} 
        onClose={() => setShowDailyQuote(false)} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Explore</Text>
          {!isProfileComplete && (
            <Text style={styles.browseLimit}>
              {browseCount}/{maxBrowseLimit} profiles today
            </Text>
          )}
        </View>
        {user && (
          <TouchableOpacity 
            style={styles.quoteIconButton} 
            onPress={() => {
              console.log('Quote button pressed, opening modal');
              setShowDailyQuote(true);
            }}
          >
            <Text style={styles.quoteIcon}>✨</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Daily Quote Card */}
      {user && (
        <DailyQuoteCard 
          onPress={() => setShowDailyQuote(true)} 
        />
      )}

      {/* Profile Cards */}
      <View style={styles.cardsContainer}>
        {profiles.map((profile, index) => renderProfileCard(profile, index))}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Swipe right to add to hotlist • Swipe left to pass
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  quoteIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  quoteIcon: {
    fontSize: 28,
  },
  browseLimit: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  photoContainer: {
    height: CARD_HEIGHT * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 48,
    color: '#999',
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    height: CARD_HEIGHT * 0.28,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 0,
  },
  ageCountry: {
    fontSize: 16,
    color: '#666',
    marginBottom: 0,
  },
  astrologyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  signItem: {
    alignItems: 'center',
    flex: 1,
  },
  signLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  signValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 10,
  },
  compatibilityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  passButton: {
    backgroundColor: '#FF6B6B',
  },
  hotlistButton: {
    backgroundColor: '#4ECDC4',
  },
  messageButton: {
    backgroundColor: '#45B7D1',
  },
  passButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  hotlistButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
