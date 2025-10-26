import * as Notifications from 'expo-notifications';
import { AstrologyContentService } from './AstrologyContentService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

export class NotificationService {
  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('NotificationService: Permission not granted');
        return false;
      }

      console.log('NotificationService: Permissions granted');
      return true;
    } catch (error) {
      console.error('NotificationService: Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Register for push notifications
   */
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID || 'astrodating-v2', // Use environment variable or fallback
      });

      console.log('NotificationService: Push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('NotificationService: Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Schedule local notification
   */
  static async scheduleLocalNotification(
    notification: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
        },
        trigger: trigger || null,
      });

      console.log('NotificationService: Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('NotificationService: Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Schedule daily astrology quote notifications
   */
  static async scheduleDailyAstrologyQuotes(userId: string): Promise<void> {
    try {
      console.log('NotificationService: Scheduling daily astrology quotes for user:', userId);

      // Cancel existing notifications
      await this.cancelAllNotifications();

      // Get user preferences
      const preferences = await AstrologyContentService.getUserNotificationPreferences(userId);

      // Schedule morning quote
      if (preferences.morningQuotes) {
        const morningTime = await AstrologyContentService.getOptimalNotificationTime(userId, 'morning');
        await this.scheduleQuoteNotification('morning', morningTime, userId);
      }

      // Schedule afternoon quote
      if (preferences.afternoonQuotes) {
        const afternoonTime = await AstrologyContentService.getOptimalNotificationTime(userId, 'afternoon');
        await this.scheduleQuoteNotification('afternoon', afternoonTime, userId);
      }

      // Schedule evening quote
      if (preferences.eveningQuotes) {
        const eveningTime = await AstrologyContentService.getOptimalNotificationTime(userId, 'evening');
        await this.scheduleQuoteNotification('evening', eveningTime, userId);
      }

      console.log('NotificationService: Daily astrology quotes scheduled');
    } catch (error) {
      console.error('NotificationService: Error scheduling daily quotes:', error);
    }
  }

  /**
   * Schedule individual quote notification
   */
  private static async scheduleQuoteNotification(
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    time: string,
    userId: string
  ): Promise<void> {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      const trigger: Notifications.DailyTriggerInput = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      const titles = {
        morning: '🌅 Morning Cosmic Guidance',
        afternoon: '☀️ Afternoon Astrology Insight',
        evening: '🌙 Evening Stellar Wisdom'
      };

      const bodies = {
        morning: 'Your personalized morning astrology quote is ready!',
        afternoon: 'Check your afternoon cosmic guidance.',
        evening: 'Your evening astrology insight awaits.'
      };

      await this.scheduleLocalNotification(
        {
          title: titles[timeOfDay],
          body: bodies[timeOfDay],
          data: {
            type: 'astrology_quote',
            timeOfDay,
            userId,
          },
        },
        trigger
      );

      console.log(`NotificationService: ${timeOfDay} quote notification scheduled for ${time}`);
    } catch (error) {
      console.error(`NotificationService: Error scheduling ${timeOfDay} notification:`, error);
    }
  }

  /**
   * Send immediate notification
   */
  static async sendImmediateNotification(notification: NotificationData): Promise<void> {
    try {
      await this.scheduleLocalNotification(notification);
      console.log('NotificationService: Immediate notification sent');
    } catch (error) {
      console.error('NotificationService: Error sending immediate notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('NotificationService: All notifications cancelled');
    } catch (error) {
      console.error('NotificationService: Error cancelling notifications:', error);
    }
  }

  /**
   * Cancel specific notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('NotificationService: Notification cancelled:', notificationId);
    } catch (error) {
      console.error('NotificationService: Error cancelling notification:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('NotificationService: Retrieved scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('NotificationService: Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Handle notification received
   */
  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Handle notification response (when user taps notification)
   */
  static addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Update notification preferences and reschedule
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: any
  ): Promise<void> {
    try {
      // Update preferences in database
      await AstrologyContentService.updateUserNotificationPreferences(userId, preferences);
      
      // Reschedule notifications
      await this.scheduleDailyAstrologyQuotes(userId);
      
      console.log('NotificationService: Notification preferences updated and rescheduled');
    } catch (error) {
      console.error('NotificationService: Error updating notification preferences:', error);
    }
  }

  /**
   * Send push notification to specific user
   */
  static async sendPushNotification(
    pushToken: string,
    notification: NotificationData
  ): Promise<boolean> {
    try {
      const message = {
        to: pushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('NotificationService: Push notification sent:', result);
      return result.data && result.data.status === 'ok';
    } catch (error) {
      console.error('NotificationService: Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send new message notification
   */
  static async sendNewMessageNotification(
    recipientToken: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
  ): Promise<boolean> {
    return this.sendPushNotification(recipientToken, {
      title: `New message from ${senderName}`,
      body: messagePreview,
      data: {
        type: 'new_message',
        conversationId,
        senderName,
      },
    });
  }

  /**
   * Send new match notification
   */
  static async sendNewMatchNotification(
    recipientToken: string,
    matchName: string,
    compatibilityScore: number
  ): Promise<boolean> {
    return this.sendPushNotification(recipientToken, {
      title: `New match! ${matchName}`,
      body: `You have ${compatibilityScore}% compatibility!`,
      data: {
        type: 'new_match',
        matchName,
        compatibilityScore,
      },
    });
  }

  /**
   * Send profile completion reminder
   */
  static async sendProfileCompletionReminder(
    recipientToken: string,
    missingFields: string[]
  ): Promise<boolean> {
    return this.sendPushNotification(recipientToken, {
      title: 'Complete your profile',
      body: `Add ${missingFields.join(', ')} to get more matches!`,
      data: {
        type: 'profile_completion',
        missingFields,
      },
    });
  }

  /**
   * Send daily horoscope notification
   */
  static async sendDailyHoroscopeNotification(
    recipientToken: string,
    signName: string,
    horoscopePreview: string
  ): Promise<boolean> {
    return this.sendPushNotification(recipientToken, {
      title: `Your ${signName} horoscope`,
      body: horoscopePreview,
      data: {
        type: 'daily_horoscope',
        signName,
      },
    });
  }
}
