import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, Message, MessageService } from '../services/MessageService';

interface ChatDetailScreenProps {
  conversation: Conversation;
  onBack?: () => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ 
  conversation, 
  onBack 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
    markMessagesAsRead();

    return () => {
      if (subscription) {
        MessageService.unsubscribe(subscription);
      }
    };
  }, [conversation.id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await MessageService.getMessages(conversation.id);
      
      if (error) {
        console.error('Failed to load messages:', error);
        Alert.alert('Error', 'Failed to load messages');
        return;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('ChatDetailScreen: Setting up real-time subscription for conversation:', conversation.id);
    const sub = MessageService.subscribeToMessages(
      conversation.id,
      (newMessage) => {
        console.log('ChatDetailScreen: Received new message via subscription:', newMessage);
        setMessages(prev => {
          // Check if this is replacing an optimistic message
          const optimisticIndex = prev.findIndex(msg => 
            msg.id.startsWith('temp_') && 
            msg.content === newMessage.content && 
            msg.sender_id === newMessage.sender_id &&
            msg.message_type === newMessage.message_type &&
            (msg.message_type === 'image' ? msg.image_url === newMessage.image_url : true)
          );
          
          if (optimisticIndex !== -1) {
            console.log('ChatDetailScreen: Replacing optimistic message with real message');
            const newMessages = [...prev];
            newMessages[optimisticIndex] = newMessage;
            return newMessages;
          }
          
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            console.log('ChatDetailScreen: Message already exists, skipping');
            return prev;
          }
          
          console.log('ChatDetailScreen: Adding new message to list');
          return [...prev, newMessage];
        });

        // Mark as read if it's a message to current user
        if (newMessage.recipient_id === user?.id && !newMessage.is_read) {
          console.log('ChatDetailScreen: Marking message as read');
          MessageService.markMessagesAsRead(conversation.id);
        }
      },
      (error) => {
        console.error('ChatDetailScreen: Message subscription error:', error);
      }
    );
    
    setSubscription(sub);
  };

  const markMessagesAsRead = async () => {
    try {
      await MessageService.markMessagesAsRead(conversation.id);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      console.log('ChatDetailScreen: Attempting to send message:', { content, conversationId: conversation.id });
      setSending(true);
      
      const recipientId = conversation.participant_a === user?.id 
        ? conversation.participant_b 
        : conversation.participant_a;
      
      console.log('ChatDetailScreen: Sending to recipient:', recipientId);
      
      // Create optimistic message for immediate UI update
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`, // Temporary ID
        conversation_id: conversation.id,
        sender_id: user?.id || '',
        recipient_id: recipientId,
        message_type: 'text',
        content: content,
        image_url: null,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add optimistic message immediately for better UX
      setMessages(prev => [...prev, optimisticMessage]);
      
      const { data, error } = await MessageService.sendMessage({
        recipient_id: recipientId,
        content,
        message_type: 'text'
      });

      console.log('ChatDetailScreen: Send message result:', { data, error });

      if (error) {
        console.error('ChatDetailScreen: Send message error:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        Alert.alert('Error', `Failed to send message: ${error.message}`);
        return;
      }

      console.log('ChatDetailScreen: Message sent successfully');
      // Real message will replace optimistic message via subscription
    } catch (error) {
      console.error('ChatDetailScreen: Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async (imageUrl: string) => {
    try {
      console.log('ChatDetailScreen: Attempting to send image:', { imageUrl, conversationId: conversation.id });
      setSending(true);
      
      const recipientId = conversation.participant_a === user?.id 
        ? conversation.participant_b 
        : conversation.participant_a;
      
      console.log('ChatDetailScreen: Sending image to recipient:', recipientId);
      
      // Create optimistic message for immediate UI update
      const optimisticMessage: Message = {
        id: `temp_img_${Date.now()}`, // Temporary ID for image
        conversation_id: conversation.id,
        sender_id: user?.id || '',
        recipient_id: recipientId,
        message_type: 'image',
        content: '',
        image_url: imageUrl,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add optimistic message immediately for better UX
      setMessages(prev => [...prev, optimisticMessage]);
      
      const { data, error } = await MessageService.sendMessage({
        recipient_id: recipientId,
        content: '', // Empty content for image messages
        message_type: 'image',
        image_url: imageUrl
      });

      console.log('ChatDetailScreen: Send image result:', { data, error });

      if (error) {
        console.error('ChatDetailScreen: Send image error:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        Alert.alert('Error', `Failed to send image: ${error.message}`);
        return;
      }

      console.log('ChatDetailScreen: Image sent successfully');
      // Real message will replace optimistic message via subscription
    } catch (error) {
      console.error('ChatDetailScreen: Error sending image:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      Alert.alert('Error', 'Failed to send image');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} isOptimistic={item.id.startsWith('temp_')} />
  );

  const otherParticipant = conversation.other_participant;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>
            {otherParticipant?.first_name} {otherParticipant?.last_name?.charAt(0)}.
          </Text>
          <Text style={styles.status}>Online</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          inverted={false}
        />
      </KeyboardAvoidingView>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        disabled={sending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  status: {
    fontSize: 14,
    color: '#666666',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});
