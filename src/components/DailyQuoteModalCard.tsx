import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AstrologyContentService } from '../services/AstrologyContentService';
import { AstrologyQuote } from '../services/GeminiAIService';

interface DailyQuoteModalCardProps {
  visible: boolean;
  onClose: () => void;
}

export const DailyQuoteModalCard: React.FC<DailyQuoteModalCardProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [quote, setQuote] = useState<AstrologyQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      console.log('DailyQuoteModalCard: Modal opened, loading quote...');
      loadTodayQuote();
    }
  }, [visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setQuote(null);
      setError(null);
    }
  }, [visible]);

  const loadTodayQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('DailyQuoteModalCard: Fetching today quotes (shared/date-based)');
      
      // Get today's shared quotes (not user-specific anymore)
      const todayQuotes = await AstrologyContentService.getTodayQuotes(user?.id);
      console.log('DailyQuoteModalCard: Today quotes received:', todayQuotes);
      
      // Use Western quote as primary (or first available)
      const primaryQuote = todayQuotes.western || todayQuotes.chinese || todayQuotes.vedic;
      console.log('DailyQuoteModalCard: Primary quote:', primaryQuote);
      
      if (!primaryQuote) {
        // No quote for today, generate new ones (use placeholder user ID if no user)
        console.log('DailyQuoteModalCard: No quote found for today, generating new quotes...');
        const userId = user?.id || 'system';
        const newQuotes = await AstrologyContentService.generateAllSystemDailyQuotes(userId);
        console.log('DailyQuoteModalCard: New quotes generated:', newQuotes);
        
        const generatedQuote = newQuotes.western || newQuotes.chinese || newQuotes.vedic;
        if (generatedQuote) {
          console.log('DailyQuoteModalCard: Generated quote content:', generatedQuote.content);
          setQuote(generatedQuote);
        } else {
          console.error('DailyQuoteModalCard: Failed to generate quotes - all quotes null');
          console.error('NewQuotes object:', newQuotes);
          setError('Unable to generate your daily quote. Please try again.');
        }
      } else {
        console.log('DailyQuoteModalCard: Using cached quote');
        console.log('Cached quote content:', primaryQuote.content);
        setQuote(primaryQuote);
      }
    } catch (err) {
      console.error('DailyQuoteModalCard: Error loading daily quote:', err);
      setError('Failed to load your daily quote');
    } finally {
      setLoading(false);
      console.log('DailyQuoteModalCard: Loading complete, quote:', quote);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      life: '🌟',
      career: '💼',
      heartbreak: '💔',
      finances: '💰',
      losses: '🕊️',
      health: '💪',
      motivation: '⚡'
    };
    return emojis[category] || '🌟';
  };

  const getTimeEmoji = (timeOfDay: string) => {
    const emojis: Record<string, string> = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌙'
    };
    return emojis[timeOfDay] || '🌟';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Generating your daily cosmic insight...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadTodayQuote}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : quote ? (
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
              <View style={styles.quoteContent}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.categoryEmoji}>{getCategoryEmoji(quote.category)}</Text>
                  <View style={styles.headerText}>
                    <Text style={styles.timeEmoji}>{getTimeEmoji(quote.timeOfDay)}</Text>
                    <Text style={styles.timeLabel}>
                      {quote.timeOfDay.charAt(0).toUpperCase() + quote.timeOfDay.slice(1)} Wisdom
                    </Text>
                  </View>
                </View>

                {/* Quote */}
                <View style={styles.quoteSection}>
                  <Text style={styles.quoteText}>{quote.content}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.signLabel}>{quote.sign}</Text>
                  <Text style={styles.categoryLabel}>{quote.category}</Text>
                </View>

                {/* Dismiss Button */}
                <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
                  <Text style={styles.dismissButtonText}>Continue Exploring</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading...' : 'No quote available'}
              </Text>
              <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
                <Text style={styles.dismissButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quoteContent: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryEmoji: {
    fontSize: 48,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  timeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  quoteSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    minHeight: 100,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  signLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
  },
  dismissButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
});
