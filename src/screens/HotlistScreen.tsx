import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { CompatibilityService } from '../services/CompatibilityService';
import { ProfileService, UserProfile } from '../services/ProfileService';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2; // 2 items per row with margins

interface HotlistScreenProps {
  onNavigateToChat?: () => void;
}

export const HotlistScreen: React.FC<HotlistScreenProps> = ({ onNavigateToChat }) => {
  const { user } = useAuth();
  const [hotlistProfiles, setHotlistProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotlist();
  }, []);

  const loadHotlist = async () => {
    try {
      setLoading(true);
      const { data, error } = await ProfileService.getHotlistProfiles();
      
      if (error) {
        Alert.alert('Error', 'Failed to load hotlist');
        return;
      }
      
      setHotlistProfiles(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load hotlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromHotlist = async (profileId: string) => {
    Alert.alert(
      'Remove from Hotlist',
      'Are you sure you want to remove this profile from your hotlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await ProfileService.removeFromHotlist(profileId);
              
              if (error) {
                Alert.alert('Error', 'Failed to remove from hotlist');
                return;
              }
              
              // Update local state
              setHotlistProfiles(prev => prev.filter(p => p.id !== profileId));
              Alert.alert('Success', 'Removed from hotlist');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove from hotlist');
            }
          },
        },
      ]
    );
  };

  const sendMessage = (profile: UserProfile) => {
    // Get current user's profile for compatibility check
    const currentUserProfile = hotlistProfiles.find(p => p.id === user?.id);
    if (!currentUserProfile) {
      Alert.alert('Error', 'Unable to check compatibility');
      return;
    }
    
    const compatibility = CompatibilityService.calculateCompatibility(currentUserProfile, profile);
    
    if (compatibility.score >= 2) {
      Alert.alert(
        'Send Message', 
        `Send a message to ${profile.first_name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Send Message', 
            onPress: () => {
              // Navigate to chat screen
              onNavigateToChat?.();
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

  const renderHotlistItem = ({ item: profile }: { item: UserProfile }) => {
    // Get current user's profile for compatibility calculation
    const currentUserProfile = hotlistProfiles.find(p => p.id === user?.id);
    const compatibility = currentUserProfile 
      ? CompatibilityService.calculateCompatibility(currentUserProfile, profile)
      : { score: 0, breakdown: {} };

    return (
      <View style={styles.hotlistItem}>
        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          {profile.profile_photo ? (
            <Image source={{ uri: profile.profile_photo }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}
          
          {/* Compatibility Badge */}
          <View style={[
            styles.compatibilityBadge,
            { backgroundColor: compatibility.score >= 2 ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.compatibilityText}>
              {compatibility.score}/3
            </Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {profile.first_name} {profile.last_name?.charAt(0)}.
          </Text>
          <Text style={styles.age}>
            {profile.age || 'Age not specified'}
          </Text>
          <Text style={styles.country}>
            {profile.country || 'Location not specified'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {compatibility.score >= 2 && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => sendMessage(profile)}
            >
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromHotlist(profile.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Loading your hotlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hotlist</Text>
      </View>

      {hotlistProfiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Profiles in Hotlist</Text>
          <Text style={styles.emptyText}>
            Start exploring profiles and swipe right to add them to your hotlist!
          </Text>
        </View>
      ) : (
        <FlatList
          data={hotlistProfiles}
          renderItem={renderHotlistItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 20,
  },
  hotlistItem: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoContainer: {
    position: 'relative',
    height: ITEM_WIDTH * 1.2,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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
  placeholderText: {
    fontSize: 40,
    color: '#999',
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  age: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  country: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  messageButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  },
});
