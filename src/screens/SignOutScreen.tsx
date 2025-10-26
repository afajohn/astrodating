import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SignOutScreenProps {
  onExplore: () => void;
}

export const SignOutScreen: React.FC<SignOutScreenProps> = ({ onExplore }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Constellation Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.constellationText}>✨</Text>
          <Text style={styles.mainMessage}>Welcome to AstroDating!</Text>
          <Text style={styles.subMessage}>
            May the stars guide you to your perfect soulmate!
          </Text>
        </View>

        {/* Explore Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.exploreButton} onPress={onExplore}>
            <Text style={styles.exploreButtonText}>Explore Your Match</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ready to find your cosmic date?
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  constellationText: {
    fontSize: 80,
    marginBottom: 24,
  },
  mainMessage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subMessage: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  exploreButton: {
    backgroundColor: '#E91E63',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
