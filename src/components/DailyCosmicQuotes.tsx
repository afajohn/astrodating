import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AstrologyContentService } from '../services/AstrologyContentService';
import { AstrologyQuote } from '../services/GeminiAIService';

interface DailyCosmicQuotesProps {
  onGenerateQuotes?: () => void;
}

export const DailyCosmicQuotes: React.FC<DailyCosmicQuotesProps> = ({ onGenerateQuotes }) => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<{
    western: AstrologyQuote | null;
    chinese: AstrologyQuote | null;
    vedic: AstrologyQuote | null;
  }>({
    western: null,
    chinese: null,
    vedic: null
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'western' | 'chinese' | 'vedic'>('western');

  useEffect(() => {
    if (user) {
      loadTodayQuotes();
    }
  }, [user]);

  const loadTodayQuotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const todayQuotes = await AstrologyContentService.getTodayQuotes(user.id);
      setQuotes(todayQuotes);

      // If no quotes found, generate new ones
      if (!todayQuotes.western && !todayQuotes.chinese && !todayQuotes.vedic) {
        await generateNewQuotes();
      }
    } catch (error) {
      console.error('Error loading today quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQuotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const newQuotes = await AstrologyContentService.generateAllSystemDailyQuotes(user.id);
      setQuotes(newQuotes);
      if (onGenerateQuotes) {
        onGenerateQuotes();
      }
    } catch (error) {
      console.error('Error generating new quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuote = () => quotes[activeTab];

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

  if (!user) {
    return null;
  }

  if (loading && !getCurrentQuote()) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating your daily cosmic quotes...</Text>
      </View>
    );
  }

  const currentQuote = getCurrentQuote();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Daily Cosmic Quotes</Text>
        <Text style={styles.headerSubtitle}>
          {currentQuote 
            ? `${getTimeEmoji(currentQuote.timeOfDay)} ${currentQuote.timeOfDay.charAt(0).toUpperCase() + currentQuote.timeOfDay.slice(1)} Wisdom`
            : 'Discover personalized insights from the cosmos'}
        </Text>
      </View>

      {/* System Tabs */}
      <View style={styles.tabs}>
        {(['western', 'chinese', 'vedic'] as const).map((system) => {
          const quoteExists = !!quotes[system];
          const isActive = activeTab === system;
          
          return (
            <TouchableOpacity
              key={system}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(system)}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {system.charAt(0).toUpperCase() + system.slice(1)}
              </Text>
              {quoteExists && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quote Content */}
      {currentQuote ? (
        <ScrollView style={styles.quoteContainer}>
          <View style={styles.quoteHeader}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(currentQuote.category)}</Text>
            <View style={styles.quoteMeta}>
              <Text style={styles.signName}>{currentQuote.sign}</Text>
              <Text style={styles.category}>{currentQuote.category}</Text>
            </View>
          </View>
          
          <Text style={styles.quoteContent}>{currentQuote.content}</Text>
          
          <View style={styles.quoteFooter}>
            <Text style={styles.timestamp}>
              Generated: {new Date(currentQuote.generatedAt).toLocaleString()}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No {activeTab} quote found for today
          </Text>
          <TouchableOpacity 
            style={styles.generateButton} 
            onPress={generateNewQuotes}
          >
            <Text style={styles.generateButtonText}>Generate Your Daily Quotes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    margin: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#fff',
  },
  checkmark: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 6,
  },
  quoteContainer: {
    marginTop: 8,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  quoteMeta: {
    flex: 1,
  },
  signName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  quoteContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 16,
  },
  quoteFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
