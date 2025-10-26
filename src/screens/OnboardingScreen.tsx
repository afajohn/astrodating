import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { ProfileService } from '../services/ProfileService';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [seeking, setSeeking] = useState<'male' | 'female' | null>(null);

  const handleContinue = async () => {
    if (!gender || !seeking) {
      Alert.alert('Please Complete', 'Please select your gender and who you\'re looking for.');
      return;
    }

    try {
      // Update user profile with gender and seeking preferences using ProfileService
      const { error } = await ProfileService.updateProfile({
        gender,
        seeking,
      });

      if (error) {
        console.error('Failed to update preferences:', error);
        Alert.alert('Error', 'Failed to save preferences. Please try again.');
        return;
      }

      onComplete();
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to AstroDating</Text>
          <Text style={styles.subtitle}>
            Find your cosmic match through astrology-based compatibility
          </Text>
        </View>

        {/* Gender Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I am a...</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                gender === 'male' && styles.optionSelected
              ]}
              onPress={() => setGender('male')}
            >
              <Text style={[
                styles.optionText,
                gender === 'male' && styles.optionTextSelected
              ]}>
                Male
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.option,
                gender === 'female' && styles.optionSelected
              ]}
              onPress={() => setGender('female')}
            >
              <Text style={[
                styles.optionText,
                gender === 'female' && styles.optionTextSelected
              ]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seeking Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking for...</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                seeking === 'male' && styles.optionSelected
              ]}
              onPress={() => setSeeking('male')}
            >
              <Text style={[
                styles.optionText,
                seeking === 'male' && styles.optionTextSelected
              ]}>
                Men
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.option,
                seeking === 'female' && styles.optionSelected
              ]}
              onPress={() => setSeeking('female')}
            >
              <Text style={[
                styles.optionText,
                seeking === 'female' && styles.optionTextSelected
              ]}>
                Women
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Astrology Preview */}
        <View style={styles.astrologyPreview}>
          <Text style={styles.previewTitle}>✨ Your Cosmic Journey</Text>
          <Text style={styles.previewText}>
            We'll match you based on Western, Chinese, and Vedic astrology compatibility
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!gender || !seeking) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!gender || !seeking}
        >
          <Text style={[
            styles.continueButtonText,
            (!gender || !seeking) && styles.continueButtonTextDisabled
          ]}>
            Continue to AstroDating
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  astrologyPreview: {
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#999999',
  },
});
