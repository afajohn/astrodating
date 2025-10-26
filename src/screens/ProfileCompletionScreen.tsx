import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AsyncSignDescription } from '../components/AsyncSignDescription';
import { useAuth } from '../contexts/AuthContext';
import { AstrologyProfile, AstrologyService } from '../services/AstrologyService';
import { ProfileService, UserProfile } from '../services/ProfileService';
import { PhotoManagementScreen } from './PhotoManagementScreen';
import { ProfileEditScreen } from './ProfileEditScreen';

interface ProfileCompletionScreenProps {
  onBack?: () => void;
}

export const ProfileCompletionScreen: React.FC<ProfileCompletionScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [astrologyProfile, setAstrologyProfile] = useState<AstrologyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isManagingPhotos, setIsManagingPhotos] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await ProfileService.getCurrentProfile();
      
      if (error) {
        Alert.alert('Error', 'Failed to load profile');
        return;
      }

      setProfile(data);
      
      // Calculate astrology profile if birth date is available
      if (data?.birth_date) {
        const astrology = AstrologyService.getAstrologyProfile(data.birth_date);
        setAstrologyProfile(astrology);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion based on reasonable criteria
  const calculateProfileCompletion = (profile: UserProfile) => {
    if (!profile) return { isComplete: false, completionPercentage: 0, missingFields: [] };
    
    const requiredFields = [
      { field: 'first_name', label: 'First Name' },
      { field: 'last_name', label: 'Last Name' },
      { field: 'birth_date', label: 'Birth Date' },
      { field: 'country', label: 'Country' },
      { field: 'gender', label: 'Gender' },
      { field: 'seeking', label: 'Seeking' },
      { field: 'marital_status', label: 'Marital Status' },
      { field: 'bio', label: 'Bio' },
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = profile[field.field as keyof UserProfile];
      return value !== null && value !== undefined && value !== '';
    });
    
    const missingFields = requiredFields.filter(field => {
      const value = profile[field.field as keyof UserProfile];
      return value === null || value === undefined || value === '';
    }).map(field => field.label);
    
    const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
    const isComplete = completionPercentage >= 80; // Consider 80%+ as complete
    
    return { isComplete, completionPercentage, missingFields };
  };

  const handleCompleteProfile = async () => {
    if (!profile) return;

    try {
      setUpdating(true);
      
      // Update astrology signs in profile
      if (astrologyProfile) {
        const { error } = await ProfileService.updateProfile({
          western_sign: astrologyProfile.westernSign,
          chinese_sign: astrologyProfile.chineseSign,
          vedic_sign: astrologyProfile.vedicSign,
        });

        if (error) {
          Alert.alert('Error', 'Failed to update astrology signs');
          return;
        }
      }

      Alert.alert('Success', 'Profile completed successfully!');
      
      // Reload profile to get updated age and other computed fields
      await loadProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleBackFromEdit = () => {
    setIsEditing(false);
    loadProfile(); // Reload profile data
  };

  if (isEditing) {
    return <ProfileEditScreen onBack={handleBackFromEdit} />;
  }

  if (isManagingPhotos) {
    return (
      <PhotoManagementScreen
        onBack={() => setIsManagingPhotos(false)}
        onProfilePhotoUpdated={loadProfile}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      {onBack && (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Your cosmic identity is ready to be revealed!
          </Text>
        </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {profile.first_name} {profile.last_name}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Age:</Text>
          <Text style={styles.value}>
            {profile.age || (profile.birth_date ? 
              Math.floor((new Date().getTime() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
              'Not specified'
            )}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Country:</Text>
          <Text style={styles.value}>{profile.country || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{profile.gender || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Seeking:</Text>
          <Text style={styles.value}>{profile.seeking || 'Not specified'}</Text>
        </View>
      </View>

      {/* Photo Gallery */}
      {profile.photos && profile.photos.filter(photo => photo).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Gallery</Text>
          <View style={styles.photoGallery}>
            {profile.photos.map((photo, index) => (
              photo && (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.galleryPhoto} />
                  {photo === profile.profile_photo && (
                    <View style={styles.profilePhotoBadge}>
                      <Text style={styles.profilePhotoBadgeText}>Profile</Text>
                    </View>
                  )}
                </View>
              )
            ))}
          </View>
        </View>
      )}

      {/* Astrology Profile */}
      {astrologyProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Cosmic Identity</Text>
          
          <View style={styles.astrologyCard}>
            <Text style={styles.astrologyTitle}>Western Zodiac</Text>
            <Text style={styles.signName}>{astrologyProfile.westernSign}</Text>
            <Text style={styles.signDescription}>
              <AsyncSignDescription 
                system="western" 
                sign={astrologyProfile.westernSign} 
                style={styles.signDescription}
              />
            </Text>
          </View>

          <View style={styles.astrologyCard}>
            <Text style={styles.astrologyTitle}>Chinese Zodiac</Text>
            <Text style={styles.signName}>{astrologyProfile.chineseSign}</Text>
            <Text style={styles.signDescription}>
              <AsyncSignDescription 
                system="chinese" 
                sign={astrologyProfile.chineseSign} 
                style={styles.signDescription}
              />
            </Text>
          </View>

          <View style={styles.astrologyCard}>
            <Text style={styles.astrologyTitle}>Vedic Astrology</Text>
            <Text style={styles.signName}>{astrologyProfile.vedicSign}</Text>
            <Text style={styles.signDescription}>
              <AsyncSignDescription 
                system="vedic" 
                sign={astrologyProfile.vedicSign} 
                style={styles.signDescription}
              />
            </Text>
          </View>
        </View>
      )}

      {/* Profile Completion Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Status</Text>
        <View style={styles.statusCard}>
          {(() => {
            const completion = calculateProfileCompletion(profile);
            return (
              <>
                <Text style={styles.statusTitle}>
                  {completion.isComplete ? '✅ Complete' : '⚠️ Incomplete'}
                </Text>
                <Text style={styles.statusText}>
                  {completion.isComplete
                    ? 'Your profile is complete and ready for matching!'
                    : `Profile ${completion.completionPercentage}% complete. Missing: ${completion.missingFields.join(', ')}`}
                </Text>
                <Text style={styles.completionPercentage}>
                  {completion.completionPercentage}% Complete
                </Text>
              </>
            );
          })()}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEditProfile}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.photosButton]}
          onPress={() => setIsManagingPhotos(true)}
        >
          <Text style={styles.photosButtonText}>Manage Photos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCompleteProfile}
          disabled={updating || calculateProfileCompletion(profile).isComplete}
        >
          <Text style={styles.buttonText}>
            {updating ? 'Updating...' : 'Complete Profile'}
          </Text>
        </TouchableOpacity>

        

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={loadProfile}
        >
          <Text style={styles.secondaryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  photoGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: (Dimensions.get('window').width - 80) / 3,
    height: (Dimensions.get('window').width - 80) / 3,
    marginBottom: 10,
    position: 'relative',
  },
  galleryPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  profilePhotoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  profilePhotoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  astrologyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  astrologyTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  signName: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  signDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  completionPercentage: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 8,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  editButton: {
    backgroundColor: '#34C759',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photosButton: {
    backgroundColor: '#34C759',
    marginBottom: 12,
  },
  photosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
