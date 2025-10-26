import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConversationItem } from '../components/ConversationItem';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, MessageService } from '../services/MessageService';

interface ChatListScreenProps {
  onBack?: () => void;
  onSelectConversation?: (conversation: Conversation) => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ 
  onBack, 
  onSelectConversation 
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    loadConversations();
    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        MessageService.unsubscribe(subscription);
      }
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await MessageService.getConversations();
      
      if (error) {
        console.error('Failed to load conversations:', error);
        return;
      }
      
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    const sub = await MessageService.subscribeToConversations(
      (updatedConversation) => {
        setConversations(prev => {
          const existingIndex = prev.findIndex(c => c.id === updatedConversation.id);
          if (existingIndex >= 0) {
            // Update existing conversation
            const updated = [...prev];
            updated[existingIndex] = updatedConversation;
            return updated;
          } else {
            // Add new conversation
            return [updatedConversation, ...prev];
          }
        });
      },
      (error) => {
        console.error('Conversation subscription error:', error);
      }
    );
    
    setSubscription(sub);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation?.(conversation);
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleSelectConversation(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Conversations Yet</Text>
          <Text style={styles.emptyText}>
            Start exploring profiles and send messages to your cosmic matches!
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  list: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
