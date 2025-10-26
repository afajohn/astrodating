import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { AstrologyContentService, UserNotificationPreferences } from '../services/AstrologyContentService';
import { NotificationService } from '../services/NotificationService';

export const NotificationPreferencesScreen: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserNotificationPreferences>({
    morningQuotes: true,
    afternoonQuotes: true,
    eveningQuotes: true,
    preferredCategories: ['life', 'motivation', 'career'],
    notificationTime: {
      morning: '08:00',
      afternoon: '14:00',
      evening: '20:00',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      if (!user) return;

      setLoading(true);
      const userPreferences = await AstrologyContentService.getUserNotificationPreferences(user.id);
      setPreferences(userPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      if (!user) return;

      setSaving(true);
      const success = await AstrologyContentService.updateUserNotificationPreferences(
        user.id,
        preferences
      );

      if (success) {
        // Reschedule notifications with new preferences
        await NotificationService.scheduleDailyAstrologyQuotes(user.id);
        Alert.alert('Success', 'Notification preferences updated!');
      } else {
        Alert.alert('Error', 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleQuoteTime = (timeOfDay: 'morning' | 'afternoon' | 'evening') => {
    setPreferences(prev => ({
      ...prev,
      [`${timeOfDay}Quotes`]: !prev[`${timeOfDay}Quotes`],
    }));
  };

  const toggleCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category],
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Astrology Notifications</Text>
          <Text style={styles.headerSubtitle}>
            Get personalized daily quotes based on your cosmic profile
          </Text>
        </View>

        {/* Quote Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Quote Times</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>🌅 Morning Quotes</Text>
              <Text style={styles.switchDescription}>
                Energizing quotes to start your day
              </Text>
            </View>
            <Switch
              value={preferences.morningQuotes}
              onValueChange={() => toggleQuoteTime('morning')}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor={preferences.morningQuotes ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>☀️ Afternoon Quotes</Text>
              <Text style={styles.switchDescription}>
                Practical guidance for your day
              </Text>
            </View>
            <Switch
              value={preferences.afternoonQuotes}
              onValueChange={() => toggleQuoteTime('afternoon')}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor={preferences.afternoonQuotes ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>🌙 Evening Quotes</Text>
              <Text style={styles.switchDescription}>
                Reflective wisdom for your evening
              </Text>
            </View>
            <Switch
              value={preferences.eveningQuotes}
              onValueChange={() => toggleQuoteTime('evening')}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor={preferences.eveningQuotes ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Preferred Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Categories</Text>
          <Text style={styles.sectionDescription}>
            Choose the types of guidance you'd like to receive
          </Text>

          {[
            { key: 'life', label: 'Life Guidance', emoji: '🌟' },
            { key: 'career', label: 'Career Success', emoji: '💼' },
            { key: 'motivation', label: 'Motivation', emoji: '🔥' },
            { key: 'health', label: 'Health & Wellness', emoji: '💚' },
            { key: 'finances', label: 'Financial Wisdom', emoji: '💰' },
            { key: 'heartbreak', label: 'Healing', emoji: '💔' },
            { key: 'losses', label: 'Moving Forward', emoji: '🕊️' },
          ].map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryRow,
                preferences.preferredCategories.includes(category.key) && styles.categoryRowSelected,
              ]}
              onPress={() => toggleCategory(category.key)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryLabel,
                preferences.preferredCategories.includes(category.key) && styles.categoryLabelSelected,
              ]}>
                {category.label}
              </Text>
              <View style={[
                styles.checkbox,
                preferences.preferredCategories.includes(category.key) && styles.checkboxSelected,
              ]}>
                {preferences.preferredCategories.includes(category.key) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={savePreferences}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 Your notification times are optimized based on your activity patterns. 
            You'll receive personalized quotes that align with your zodiac sign and chosen categories.
          </Text>
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
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  categoryRowSelected: {
    backgroundColor: '#e3f2fd',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryLabelSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 15,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
