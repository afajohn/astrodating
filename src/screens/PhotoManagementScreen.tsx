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
import { useAuth } from '../contexts/AuthContext';
import { PhotoUploadService } from '../services/PhotoUploadService';
import { ProfileService } from '../services/ProfileService';
import { testOptimisticUpdates, testRealtimeMessaging } from '../utils/testRealtimeMessaging';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 3; // 3 photos per row with margins

interface PhotoManagementScreenProps {
  onBack: () => void;
  onProfilePhotoUpdated?: () => void;
}

export const PhotoManagementScreen: React.FC<PhotoManagementScreenProps> = ({ onBack, onProfilePhotoUpdated }) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null); // Index of photo being uploaded

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const { data: profile } = await ProfileService.getCurrentProfile();
      
      if (profile?.photos) {
        setPhotos(profile.photos);
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (photoIndex: number, source: 'camera' | 'library') => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setUploading(photoIndex);
      
      const result = await PhotoUploadService.uploadPhoto(user.id, photoIndex, source);
      
      if (result.success && result.url) {
        // Update photos array
        const newPhotos = [...photos];
        newPhotos[photoIndex] = result.url;
        setPhotos(newPhotos);

        // Update profile in database
        await ProfileService.updateProfile({ photos: newPhotos });
        
        Alert.alert('Success', 'Photo uploaded successfully!');
      } else {
        Alert.alert('Error', result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(null);
    }
  };

  const handlePhotoDelete = async (photoIndex: number) => {
    try {
      const photoUrl = photos[photoIndex];
      if (!photoUrl) return;

      Alert.alert(
        'Delete Photo',
        'Are you sure you want to delete this photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Delete from Supabase Storage
              const deleteResult = await PhotoUploadService.deletePhoto(photoUrl);
              
              if (deleteResult.success) {
                // Update photos array
                const newPhotos = [...photos];
                newPhotos[photoIndex] = '';
                setPhotos(newPhotos);

                // Update profile in database
                await ProfileService.updateProfile({ photos: newPhotos });
                
                Alert.alert('Success', 'Photo deleted successfully!');
              } else {
                Alert.alert('Error', deleteResult.error || 'Delete failed');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete photo');
    }
  };

  const handleSetProfilePhoto = async (photoUrl: string) => {
    try {
      const result = await ProfileService.updateProfile({
        profile_photo: photoUrl,
      });
      
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Profile photo updated successfully!');
        onProfilePhotoUpdated?.(); // Notify parent component
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };

  const handleRealtimeMessagingTest = async () => {
    try {
      console.log('🧪 Testing real-time messaging...');
      const result = await testRealtimeMessaging();
      Alert.alert(
        'Real-time Messaging Test', 
        result ? '✅ Real-time messaging is working!' : '❌ Real-time messaging test failed. Check console for details.'
      );
    } catch (error) {
      console.error('Real-time messaging test error:', error);
      Alert.alert('Real-time Messaging Test Error', 'Failed to run test');
    }
  };

  const handleOptimisticUpdatesTest = () => {
    try {
      console.log('🧪 Testing optimistic updates...');
      const result = testOptimisticUpdates();
      Alert.alert(
        'Optimistic Updates Test', 
        result ? '✅ Optimistic updates are working!' : '❌ Optimistic updates test failed.'
      );
    } catch (error) {
      console.error('Optimistic updates test error:', error);
      Alert.alert('Optimistic Updates Test Error', 'Failed to run test');
    }
  };

  const showPhotoOptions = (photoIndex: number) => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => handlePhotoUpload(photoIndex, 'camera') },
        { text: 'Photo Library', onPress: () => handlePhotoUpload(photoIndex, 'library') },
      ]
    );
  };

  const renderPhotoSlot = (index: number) => {
    const photoUrl = photos[index];
    const isUploading = uploading === index;

    return (
      <View key={index} style={styles.photoSlot}>
        {photoUrl ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUrl }} style={styles.photo} />
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.setProfileButton}
                onPress={() => handleSetProfilePhoto(photoUrl)}
              >
                <Text style={styles.setProfileButtonText}>Set as Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handlePhotoDelete(index)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() => showPhotoOptions(index)}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.addPhotoText}>+</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Manage Photos</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Profile Photos</Text>
          <Text style={styles.infoText}>
            Add up to 5 photos to complete your profile. Photos help others get to know you better.
          </Text>
        </View>

        <View style={styles.photosGrid}>
          {Array.from({ length: 5 }, (_, index) => renderPhotoSlot(index))}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Photo Tips</Text>
          <Text style={styles.tipText}>• Use clear, well-lit photos</Text>
          <Text style={styles.tipText}>• Show your face clearly</Text>
          <Text style={styles.tipText}>• Use recent photos</Text>
          <Text style={styles.tipText}>• Avoid group photos</Text>
        </View>

         <View style={styles.debugSection}>
           <TouchableOpacity style={styles.debugButton} onPress={handleRealtimeMessagingTest}>
             <Text style={styles.debugButtonText}>💬 Test Real-time Messaging</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={[styles.debugButton, { marginTop: 8 }]} onPress={handleOptimisticUpdatesTest}>
             <Text style={styles.debugButtonText}>⚡ Test Optimistic Updates</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  photoSlot: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginBottom: 10,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  photoActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
  },
  setProfileButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
    marginRight: 4,
  },
  setProfileButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  addPhotoText: {
    fontSize: 32,
    color: '#666',
    fontWeight: '300',
  },
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  debugSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
