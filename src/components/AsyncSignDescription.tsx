import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AstrologyService } from '../services/AstrologyService';

interface AsyncSignDescriptionProps {
  system: 'western' | 'chinese' | 'vedic';
  sign: string;
  style?: any;
}

export const AsyncSignDescription: React.FC<AsyncSignDescriptionProps> = ({ 
  system, 
  sign, 
  style 
}) => {
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDescription = async () => {
      try {
        setLoading(true);
        const desc = await AstrologyService.getSignDescription(system, sign);
        setDescription(desc);
      } catch (error) {
        console.error('Error loading sign description:', error);
        // Fallback to sync version
        const fallbackDesc = AstrologyService.getSignDescriptionSync(system, sign);
        setDescription(fallbackDesc);
      } finally {
        setLoading(false);
      }
    };

    loadDescription();
  }, [system, sign]);

  if (loading) {
    return (
      <Text style={[styles.loadingText, style]}>
        <ActivityIndicator size="small" color="#666" /> Loading description...
      </Text>
    );
  }

  return <Text style={style}>{description}</Text>;
};

const styles = StyleSheet.create({
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
