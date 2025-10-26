import { supabase } from '../../lib/supabase';
import { NotificationService } from './NotificationService';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'text' | 'image';
  content: string | null;
  image_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender: string | null;
  initiated_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  other_participant?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo: string | null;
  };
  unread_count?: number;
}

export interface SendMessageData {
  recipient_id: string;
  content: string;
  message_type?: 'text' | 'image';
  image_url?: string;
}

export class MessageService {
  /**
   * Get all conversations for the current user
   */
  static async getConversations(): Promise<{ data: Conversation[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } };
      }

      // Get conversations where user is a participant
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          other_participant:profiles!conversations_participant_b_fkey(
            id,
            first_name,
            last_name,
            profile_photo
          )
        `)
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      // Get unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conversation) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false);

          return {
            ...conversation,
            unread_count: count || 0,
          };
        })
      );

      return { data: conversationsWithUnread, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get messages for a specific conversation
   */
  static async getMessages(conversationId: string): Promise<{ data: Message[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } };
      }

      // Verify user is participant in this conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .single();

      if (convError || !conversation) {
        return { data: null, error: { message: 'Conversation not found or access denied' } };
      }

      // Get messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Send a message to another user
   */
  static async sendMessage(messageData: SendMessageData): Promise<{ data: Message | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } };
      }

      // Check if conversation already exists
      let conversationId: string;
      
      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_a.eq.${user.id},participant_b.eq.${messageData.recipient_id}),and(participant_a.eq.${messageData.recipient_id},participant_b.eq.${user.id})`)
        .single();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert({
            participant_a: user.id,
            participant_b: messageData.recipient_id,
            initiated_by: user.id,
          })
          .select('id')
          .single();

        if (newConvError || !newConv) {
          return { data: null, error: newConvError || { message: 'Failed to create conversation' } };
        }

        conversationId = newConv.id;
      }

      // Send the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: messageData.recipient_id,
          message_type: messageData.message_type || 'text',
          content: messageData.content,
          image_url: messageData.image_url,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Update conversation with last message info
      await supabase
        .from('conversations')
        .update({
          last_message: messageData.content,
          last_message_at: new Date().toISOString(),
          last_message_sender: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      // Send push notification to recipient
      try {
        await this.sendMessageNotification(data, user.id);
      } catch (notificationError) {
        console.error('MessageService: Error sending notification:', notificationError);
        // Don't fail the message send if notification fails
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(conversationId: string): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'No authenticated user' } };
      }

      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Subscribe to real-time message updates for a conversation
   */
  static subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void,
    onError?: (error: any) => void
  ) {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error');
          onError?.({ message: 'Failed to subscribe to messages' });
        }
      });

    return subscription;
  }

  /**
   * Subscribe to real-time conversation updates
   */
  static async subscribeToConversations(
    onConversationUpdate: (conversation: Conversation) => void,
    onError?: (error: any) => void
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      onError?.({ message: 'No authenticated user' });
      return null;
    }

    const subscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant_a.eq.${user.id},participant_b.eq.${user.id})`,
        },
        (payload) => {
          onConversationUpdate(payload.new as Conversation);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to conversations');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Conversation subscription error');
          onError?.({ message: 'Failed to subscribe to conversations' });
        }
      });

    return subscription;
  }

  /**
   * Unsubscribe from real-time updates
   */
  static unsubscribe(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  /**
   * Check if user can send message to another user (compatibility check)
   */
  static async canSendMessage(recipientId: string): Promise<{ canSend: boolean; error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { canSend: false, error: { message: 'No authenticated user' } };
      }

      // Get compatibility between users
      const { data: compatibility, error } = await supabase
        .from('user_compatibility')
        .select('is_match')
        .or(`and(user_a.eq.${user.id},user_b.eq.${recipientId}),and(user_a.eq.${recipientId},user_b.eq.${user.id})`)
        .single();

      if (error) {
        return { canSend: false, error };
      }

      return { canSend: compatibility?.is_match || false };
    } catch (error) {
      return { canSend: false, error };
    }
  }

  /**
   * Send push notification for new message
   */
  private static async sendMessageNotification(message: Message, senderId: string): Promise<void> {
    try {
      // Get recipient's push token
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('first_name, push_token')
        .eq('id', message.recipient_id)
        .single();

      if (!recipientProfile?.push_token) {
        console.log('MessageService: No push token for recipient');
        return;
      }

      // Get sender's name
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', senderId)
        .single();

      const senderName = senderProfile?.first_name || 'Someone';

      // Create message preview
      let messagePreview = message.content;
      if (message.message_type === 'image') {
        messagePreview = '📷 Photo';
      } else if (message.content.length > 50) {
        messagePreview = message.content.substring(0, 50) + '...';
      }

      // Send notification
      await NotificationService.sendNewMessageNotification(
        recipientProfile.push_token,
        senderName,
        messagePreview,
        message.conversation_id
      );

      console.log('MessageService: Message notification sent');
    } catch (error) {
      console.error('MessageService: Error sending message notification:', error);
    }
  }
}
