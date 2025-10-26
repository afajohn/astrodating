import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AIAstrologicalProfile } from '../components/AIAstrologicalProfile';
import { useAuth } from '../contexts/AuthContext';
import { AstrologyService } from '../services/AstrologyService';
import { ProfileService, UserProfile } from '../services/ProfileService';

interface AccountScreenProps {
  onBack?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToPhotos?: () => void;
  onSignOut?: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ 
  onBack, 
  onNavigateToProfile, 
  onNavigateToPhotos,
  onSignOut
}) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await ProfileService.getCurrentProfile();
      
      if (error) {
        console.error('Failed to load profile:', error);
      } else {
        setProfile(data);
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
      'May the constellation be with you! Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              onSignOut?.(); // Navigate to signout screen
            }
          },
        },
      ]
    );
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 7; // Total required fields
    
    if (profile.first_name) completed++;
    if (profile.last_name) completed++;
    if (profile.birth_date) completed++;
    if (profile.country) completed++;
    if (profile.marital_status) completed++;
    if (profile.bio) completed++;
    if (profile.photos && profile.photos.length === 5) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const renderMenuItem = (title: string, subtitle: string, onPress: () => void, icon: string) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuItemIcon}>{icon}</Text>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.menuItemArrow}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {profile?.profile_photo ? (
                <Image source={{ uri: profile.profile_photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>👤</Text>
                </View>
              )}
            </View>
            
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {profile?.first_name || 'Complete your profile'} {profile?.last_name || ''}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              
              {/* Profile Completion */}
              <View style={styles.completionContainer}>
                <Text style={styles.completionText}>
                  Profile {getProfileCompletionPercentage()}% complete
                </Text>
                <View style={styles.completionBar}>
                  <View 
                    style={[
                      styles.completionFill, 
                      { width: `${getProfileCompletionPercentage()}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Astrology Section */}
        {profile?.birth_date && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Astrological Profile</Text>
            
            {/* Basic Signs Display */}
            <View style={styles.astrologyContainer}>
              {(() => {
                const astrology = AstrologyService.getAstrologyProfile(profile.birth_date);
                return (
                  <>
                    <View style={styles.astrologyItem}>
                      <Text style={styles.astrologyLabel}>Western</Text>
                      <Text style={styles.astrologyValue}>{astrology.westernSign}</Text>
                    </View>
                    <View style={styles.astrologyItem}>
                      <Text style={styles.astrologyLabel}>Chinese</Text>
                      <Text style={styles.astrologyValue}>{astrology.chineseSign}</Text>
                    </View>
                    <View style={styles.astrologyItem}>
                      <Text style={styles.astrologyLabel}>Vedic</Text>
                      <Text style={styles.astrologyValue}>{astrology.vedicSign}</Text>
                    </View>
                  </>
                );
              })()}
            </View>

            {/* AI-Assisted Profile */}
            <AIAstrologicalProfile birthDate={profile.birth_date} />
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          
          {renderMenuItem(
            'Edit Profile',
            'Update your personal information',
            () => onNavigateToProfile?.(),
            '✏️'
          )}
          
          {renderMenuItem(
            'Manage Photos',
            'Add or update your profile photos',
            () => onNavigateToPhotos?.(),
            '📷'
          )}
          
          {renderMenuItem(
            'Astrology Insights',
            'Learn about your compatibility',
            () => Alert.alert('Coming Soon', 'Astrology insights will be available soon!'),
            '✨'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          {renderMenuItem(
            'Notifications',
            'Manage your notification preferences',
            () => Alert.alert('Coming Soon', 'Notification settings will be available soon!'),
            '🔔'
          )}
          
          {renderMenuItem(
            'Privacy & Safety',
            'Control your privacy settings',
            () => Alert.alert('Coming Soon', 'Privacy settings will be available soon!'),
            '🔒'
          )}
          
          {renderMenuItem(
            'Help & Support',
            'Get help or contact support',
            () => Alert.alert('Coming Soon', 'Help & support will be available soon!'),
            '❓'
          )}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#E91E63',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    borderWidth: 3,
    borderColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    color: '#999999',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  completionContainer: {
    marginTop: 8,
  },
  completionText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  completionBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  astrologyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  astrologyItem: {
    alignItems: 'center',
  },
  astrologyLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  astrologyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#CCCCCC',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
