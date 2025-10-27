import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AstrologyContentService } from '../services/AstrologyContentService';

interface DailyQuoteCardProps {
  onPress: () => void;
}

export const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({ onPress }) => {
  const { user } = useAuth();
  const [hasQuotes, setHasQuotes] = useState(false);

  // Check if user has quotes today
  React.useEffect(() => {
    if (user) {
      checkForQuotes();
    }
  }, [user]);

  const checkForQuotes = async () => {
    try {
      // Quotes are now shared/date-based (not user-specific)
      const quotes = await AstrologyContentService.getTodayQuotes();
      const hasAnyQuote = !!quotes.western || !!quotes.chinese || !!quotes.vedic;
      setHasQuotes(hasAnyQuote);
    } catch (error) {
      console.error('Error checking quotes:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✨</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Your Daily Cosmic Quotes</Text>
        <Text style={styles.subtitle}>
          {hasQuotes ? 'Tap to view your personalized quotes' : 'Get your daily inspiration'}
        </Text>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFE5E5',
    borderRadius: 16,
    padding: 18,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: '#007AFF',
  },
});
