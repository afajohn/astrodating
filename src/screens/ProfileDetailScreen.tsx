import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { AstrologyService } from '../services/AstrologyService';
import { CompatibilityService } from '../services/CompatibilityService';
import { MessageService } from '../services/MessageService';
import { ProfileService, UserProfile } from '../services/ProfileService';

const { width: screenWidth } = Dimensions.get('window');

interface ProfileDetailScreenProps {
  profile: UserProfile;
  onBack: () => void;
  onNavigateToChat?: (conversationId: string) => void;
}

export const ProfileDetailScreen: React.FC<ProfileDetailScreenProps> = ({
  profile,
  onBack,
  onNavigateToChat,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadCurrentUserProfile();
  }, []);

  const loadCurrentUserProfile = async () => {
    try {
      if (user) {
        const { data } = await ProfileService.getCurrentProfile();
        setCurrentUserProfile(data);
      }
    } catch (error) {
      console.error('Failed to load current user profile:', error);
    }
  };

  // Calculate compatibility
  const calculateCompatibility = () => {
    if (!user?.id || !currentUserProfile) return { score: 0, breakdown: {} };
    
    return CompatibilityService.calculateCompatibility(currentUserProfile, profile);
  };

  const compatibility = calculateCompatibility();
  const compatibilityPercentage = Math.round((compatibility.score / 3) * 100);

  // Calculate initials
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleSendIntroMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }

    try {
      setSendingMessage(true);
      
      // Send message (this will create conversation if it doesn't exist)
      const { data: sentMessage, error: messageError } = await MessageService.sendMessage({
        recipient_id: profile.id,
        content: message.trim(),
        message_type: 'text'
      });

      if (messageError) {
        Alert.alert('Error', `Failed to send message: ${messageError.message}`);
        return;
      }

      Alert.alert(
        'Message Sent!',
        `Your intro message has been sent to ${profile.first_name}`,
        [
          {
            text: 'View Conversation',
            onPress: () => {
              // Find the conversation and navigate to it
              MessageService.getConversations().then(({ data: conversations }) => {
                const conversation = conversations?.find(conv => 
                  conv.participant_a === user?.id || conv.participant_b === user?.id
                );
                if (conversation) {
                  onNavigateToChat?.(conversation.id);
                }
              });
            },
          },
          { text: 'OK', onPress: onBack },
        ]
      );
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAddToHotlist = async () => {
    try {
      await ProfileService.addToHotlist(profile.id);
      Alert.alert('Added to Hotlist', `${profile.first_name} has been added to your hotlist!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to hotlist');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          {profile.profile_photo ? (
            <Image source={{ uri: profile.profile_photo }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
          
          {/* Compatibility Badge */}
          <View style={[
            styles.compatibilityBadge,
            { backgroundColor: compatibility.score >= 2 ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.compatibilityText}>
              {compatibilityPercentage}% Match
            </Text>
          </View>
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
              {profile.age || 'Not specified'}
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
          <View style={styles.infoRow}>
            <Text style={styles.label}>Marital Status:</Text>
            <Text style={styles.value}>{profile.marital_status || 'Not specified'}</Text>
          </View>
        </View>

        {/* Bio */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        )}

        {/* Astrology Signs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Astrology Profile</Text>
          <View style={styles.astrologyContainer}>
            <View style={styles.signCard}>
              <Text style={styles.signTitle}>Western</Text>
              <Text style={styles.signValue}>
                {(() => {
                  if (!profile.birth_date) return 'N/A';
                  const astrology = AstrologyService.getAstrologyProfile(profile.birth_date);
                  return astrology.westernSign;
                })()}
              </Text>
            </View>
            <View style={styles.signCard}>
              <Text style={styles.signTitle}>Chinese</Text>
              <Text style={styles.signValue}>
                {(() => {
                  if (!profile.birth_date) return 'N/A';
                  const astrology = AstrologyService.getAstrologyProfile(profile.birth_date);
                  return astrology.chineseSign;
                })()}
              </Text>
            </View>
            <View style={styles.signCard}>
              <Text style={styles.signTitle}>Vedic</Text>
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

        {/* Compatibility Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compatibility</Text>
          <View style={styles.compatibilityCard}>
            <Text style={styles.compatibilityTitle}>
              {compatibilityPercentage}% Cosmic Match
            </Text>
            <Text style={styles.compatibilitySubtitle}>
              {compatibility.score}/3 astrology systems match
            </Text>
            {compatibility.breakdown && Object.keys(compatibility.breakdown).length > 0 && (
              <View style={styles.breakdownContainer}>
                {Object.entries(compatibility.breakdown).map(([system, score]) => (
                  <View key={system} style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>{system}:</Text>
                    <Text style={styles.breakdownValue}>{score ? '✓' : '✗'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Send Message Section */}
        {compatibility.score >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send Intro Message</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder={`Send a message to ${profile.first_name}...`}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
              onPress={handleSendIntroMessage}
              disabled={sendingMessage}
            >
              <Text style={styles.sendButtonText}>
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.hotlistButton]}
            onPress={handleAddToHotlist}
          >
            <Text style={styles.hotlistButtonText}>Add to Hotlist</Text>
          </TouchableOpacity>
          
          {compatibility.score < 2 && (
            <View style={styles.compatibilityWarning}>
              <Text style={styles.warningText}>
                You need at least 2/3 compatibility to send messages
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  scrollContainer: {
    flex: 1,
  },
  photoContainer: {
    height: 300,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profilePhoto: {
    width: screenWidth - 40,
    height: 300,
    resizeMode: 'cover',
  },
  placeholderPhoto: {
    width: screenWidth - 40,
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 80,
    color: '#999',
    fontWeight: 'bold',
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  compatibilityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
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
  bio: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  astrologyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  signTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  signValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  compatibilityCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  compatibilityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  compatibilitySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    padding: 20,
  },
  actionButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  hotlistButton: {
    backgroundColor: '#4ECDC4',
  },
  hotlistButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  compatibilityWarning: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});
