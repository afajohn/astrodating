import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Conversation } from '../services/MessageService';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  onPress 
}) => {
  const otherParticipant = conversation.other_participant;
  const hasUnread = (conversation.unread_count || 0) > 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Profile Photo */}
      <View style={styles.photoContainer}>
        {otherParticipant?.profile_photo ? (
          <Image 
            source={{ uri: otherParticipant.profile_photo }} 
            style={styles.profilePhoto} 
          />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Text style={styles.placeholderText}>👤</Text>
          </View>
        )}
        
        {hasUnread && <View style={styles.unreadBadge} />}
      </View>

      {/* Conversation Info */}
      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {otherParticipant?.first_name} {otherParticipant?.last_name?.charAt(0)}.
          </Text>
          <Text style={styles.timestamp}>
            {conversation.last_message_at 
              ? new Date(conversation.last_message_at).toLocaleDateString()
              : ''
            }
          </Text>
        </View>
        
        <Text 
          style={[
            styles.lastMessage,
            hasUnread && styles.unreadMessage
          ]} 
          numberOfLines={2}
        >
          {conversation.last_message || 'No messages yet'}
        </Text>
      </View>

      {/* Unread Count */}
      {hasUnread && (
        <View style={styles.unreadCountContainer}>
          <Text style={styles.unreadCount}>
            {conversation.unread_count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#999999',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#000000',
  },
  unreadCountContainer: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
