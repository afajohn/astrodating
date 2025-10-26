import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AstrologyContentService, SignDescription } from '../services/AstrologyContentService';
import { AstrologyService } from '../services/AstrologyService';

interface PersonalizedSignDescriptionProps {
  birthDate: string;
  signType: 'western' | 'chinese' | 'vedic';
}

export const PersonalizedSignDescription: React.FC<PersonalizedSignDescriptionProps> = ({
  birthDate,
  signType,
}) => {
  const [signDescription, setSignDescription] = useState<SignDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSignDescription();
  }, [birthDate, signType]);

  const loadSignDescription = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the sign based on type
      let sign: string;
      switch (signType) {
        case 'western':
          sign = AstrologyService.getWesternSign(birthDate);
          break;
        case 'chinese':
          sign = AstrologyService.getChineseSign(birthDate);
          break;
        case 'vedic':
          sign = AstrologyService.getVedicSign(birthDate);
          break;
        default:
          throw new Error('Invalid sign type');
      }

      console.log('PersonalizedSignDescription: Loading description for', { sign, signType });

      // Generate or fetch sign description
      const description = await AstrologyContentService.generateSignDescription(sign);
      
      if (description) {
        setSignDescription(description);
      } else {
        setError('Failed to load sign description');
      }
    } catch (err) {
      console.error('PersonalizedSignDescription: Error loading description:', err);
      setError('Failed to load sign description');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your cosmic profile...</Text>
      </View>
    );
  }

  if (error || !signDescription) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Unable to load your cosmic profile'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Cosmic Profile</Text>
        <Text style={styles.description}>{signDescription.description}</Text>
      </View>

      {/* Strengths */}
      {signDescription.strengths && signDescription.strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Your Strengths</Text>
          {signDescription.strengths.map((strength, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>{strength}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Challenges */}
      {signDescription.challenges && signDescription.challenges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌙 Growth Areas</Text>
          {signDescription.challenges.map((challenge, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>{challenge}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Advice */}
      {signDescription.advice && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Cosmic Guidance</Text>
          <View style={styles.adviceContainer}>
            <Text style={styles.adviceText}>"{signDescription.advice}"</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
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
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    textAlign: 'justify',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 18,
    color: '#007AFF',
    marginRight: 10,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  adviceContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  adviceText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
  },
});
