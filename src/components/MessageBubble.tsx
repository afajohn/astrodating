import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../services/MessageService';

interface MessageBubbleProps {
  message: Message;
  isOptimistic?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOptimistic = false }) => {
  const { user } = useAuth();
  const isOwnMessage = message.sender_id === user?.id;

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessage : styles.otherMessage,
      isOptimistic && styles.optimisticMessage
    ]}>
      <View style={[
        styles.bubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble,
        isOptimistic && styles.optimisticBubble
      ]}>
        {message.message_type === 'text' && (
          <Text style={[
            styles.text,
            isOwnMessage ? styles.ownText : styles.otherText
          ]}>
            {message.content}
          </Text>
        )}
        
        {message.message_type === 'image' && message.image_url && (
          <TouchableOpacity style={styles.imageContainer}>
            <Image 
              source={{ uri: message.image_url }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
            {message.content && (
              <Text style={[
                styles.text,
                isOwnMessage ? styles.ownText : styles.otherText,
                styles.imageCaption
              ]}>
                {message.content}
              </Text>
            )}
          </TouchableOpacity>
        )}
        
        <Text style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
        ]}>
          {isOptimistic ? 'Sending...' : new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#000000',
  },
  imageContainer: {
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  imageCaption: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  ownTimestamp: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#666666',
    textAlign: 'left',
  },
  optimisticMessage: {
    opacity: 0.7,
  },
  optimisticBubble: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
});
