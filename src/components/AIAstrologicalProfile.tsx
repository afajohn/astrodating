import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AstrologicalSymbolsService } from '../services/AstrologicalSymbolsService';
import { AstrologyContentService } from '../services/AstrologyContentService';
import { AstrologyService } from '../services/AstrologyService';
import { SignDescription } from '../services/GeminiAIService';

interface AIAstrologicalProfileProps {
  birthDate: string;
}

export const AIAstrologicalProfile: React.FC<AIAstrologicalProfileProps> = ({ birthDate }) => {
  const [signDescriptions, setSignDescriptions] = useState<{
    western: SignDescription | null;
    chinese: SignDescription | null;
    vedic: SignDescription | null;
  }>({
    western: null,
    chinese: null,
    vedic: null,
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'western' | 'chinese' | 'vedic'>('western');

  // Get astrology profile
  const astrology = AstrologyService.getAstrologyProfile(birthDate);

  const loadSignDescription = async (signType: 'western' | 'chinese' | 'vedic') => {
    try {
      setLoading(true);
      setError(null);

      const signName = signType === 'western' ? astrology.westernSign : 
                      signType === 'chinese' ? astrology.chineseSign : 
                      astrology.vedicSign;

      const description = await AstrologyContentService.generateSignDescription(signName, signType);
      
      if (description) {
        setSignDescriptions(prev => ({
          ...prev,
          [signType]: description
        }));
      } else {
        setError(`Unable to generate your ${signType} cosmic profile`);
      }
    } catch (err) {
      console.error('Error loading sign description:', err);
      setError(`Failed to load your ${signType} cosmic profile`);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSignDescriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all three sign descriptions in parallel with their respective astrology systems
      const [westernDesc, chineseDesc, vedicDesc] = await Promise.all([
        AstrologyContentService.generateSignDescription(astrology.westernSign, 'western'),
        AstrologyContentService.generateSignDescription(astrology.chineseSign, 'chinese'),
        AstrologyContentService.generateSignDescription(astrology.vedicSign, 'vedic')
      ]);

      setSignDescriptions({
        western: westernDesc,
        chinese: chineseDesc,
        vedic: vedicDesc
      });
    } catch (err) {
      console.error('Error loading all sign descriptions:', err);
      setError('Failed to load your cosmic profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullProfile = () => {
    // Load all descriptions if none are loaded yet
    const hasAnyDescription = signDescriptions.western || signDescriptions.chinese || signDescriptions.vedic;
    if (!hasAnyDescription) {
      loadAllSignDescriptions();
    }
    setModalVisible(true);
  };

  const getPreviewText = () => {
    const currentDescription = signDescriptions[activeTab];
    if (currentDescription) {
      return currentDescription.description.substring(0, 80) + '...';
    }
    const signName = activeTab === 'western' ? astrology.westernSign : 
                    activeTab === 'chinese' ? astrology.chineseSign : 
                    astrology.vedicSign;
    return `Discover your unique ${signName} cosmic energy and unlock your potential...`;
  };

  const getCurrentSignInfo = () => {
    const signName = activeTab === 'western' ? astrology.westernSign : 
                    activeTab === 'chinese' ? astrology.chineseSign : 
                    astrology.vedicSign;
    const signDescription = signDescriptions[activeTab];
    return { signName, signDescription };
  };

  const getAstrologicalSymbol = (signType: 'western' | 'chinese' | 'vedic', signName: string): string => {
    return AstrologicalSymbolsService.getSymbol(signType, signName);
  };

  return (
    <>
      {/* Preview Card */}
      <TouchableOpacity style={styles.previewCard} onPress={handleViewFullProfile}>
        <View style={styles.previewHeader}>
          <View style={styles.previewIconContainer}>
            <Text style={styles.previewIcon}>
              {getAstrologicalSymbol(activeTab, getCurrentSignInfo().signName)}
            </Text>
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>AI Cosmic Profile</Text>
            <Text style={styles.previewSubtitle}>
              Your personalized astrology insights
            </Text>
          </View>
          <Text style={styles.previewArrow}>›</Text>
        </View>
        
        {/* Sign Tabs */}
        <View style={styles.signTabs}>
          {(['western', 'chinese', 'vedic'] as const).map((signType) => {
            const signName = signType === 'western' ? astrology.westernSign : 
                            signType === 'chinese' ? astrology.chineseSign : 
                            astrology.vedicSign;
            const isActive = activeTab === signType;
            const hasDescription = !!signDescriptions[signType];
            
            return (
              <TouchableOpacity
                key={signType}
                style={[styles.signTab, isActive && styles.signTabActive]}
                onPress={() => setActiveTab(signType)}
              >
                <Text style={[styles.signTabLabel, isActive && styles.signTabLabelActive]}>
                  {signType.charAt(0).toUpperCase() + signType.slice(1)}
                </Text>
                <Text style={[styles.signTabValue, isActive && styles.signTabValueActive]}>
                  {signName}
                </Text>
                {hasDescription && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <View style={styles.previewDescription}>
          <Text style={styles.previewText}>
            {loading ? 'Generating your cosmic profile...' : getPreviewText()}
          </Text>
          {loading && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />
          )}
        </View>
      </TouchableOpacity>

      {/* Full Profile Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>🔮 Your Complete Astrological Profile</Text>
            <View style={styles.placeholder} />
          </View>

           <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
             {/* Sign Tabs */}
             <View style={styles.modalSignTabs}>
               {(['western', 'chinese', 'vedic'] as const).map((signType) => {
                 const signName = signType === 'western' ? astrology.westernSign : 
                                 signType === 'chinese' ? astrology.chineseSign : 
                                 astrology.vedicSign;
                 const isActive = activeTab === signType;
                 const hasDescription = !!signDescriptions[signType];
                 
                 return (
                   <TouchableOpacity
                     key={signType}
                     style={[styles.modalSignTab, isActive && styles.modalSignTabActive]}
                     onPress={() => setActiveTab(signType)}
                   >
                     <Text style={[styles.modalSignTabLabel, isActive && styles.modalSignTabLabelActive]}>
                       {signType.charAt(0).toUpperCase() + signType.slice(1)}
                     </Text>
                     <Text style={[styles.modalSignTabValue, isActive && styles.modalSignTabValueActive]}>
                       {signName}
                     </Text>
                     {hasDescription && <Text style={styles.modalCheckmark}>✓</Text>}
                   </TouchableOpacity>
                 );
               })}
             </View>

             
             {/* Sign Header */}
             <View style={styles.signHeader}>
               <Text style={styles.signEmoji}>
                 {getAstrologicalSymbol(activeTab, getCurrentSignInfo().signName)}
               </Text>
               <Text style={styles.signTitle}>{getCurrentSignInfo().signName}</Text>
               <Text style={styles.signSubtitle}>
                 Your {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Cosmic Identity
               </Text>
               {getCurrentSignInfo().signDescription?.advice && (
                 <View style={styles.adviceContainer}>
                   <Text style={styles.adviceText}>"{getCurrentSignInfo().signDescription!.advice}"</Text>
                 </View>
               )}
             </View>

             {/* Main Description */}
             {getCurrentSignInfo().signDescription ? (
               <View style={styles.descriptionSection}>
                 <Text style={styles.descriptionTitle}>🌟 Your Cosmic Essence</Text>
                 <Text style={styles.descriptionText}>{getCurrentSignInfo().signDescription!.description}</Text>
               </View>
             ) : error ? (
               <View style={styles.errorSection}>
                 <Text style={styles.errorText}>{error}</Text>
                 <TouchableOpacity style={styles.retryButton} onPress={() => loadSignDescription(activeTab)}>
                   <Text style={styles.retryButtonText}>Try Again</Text>
                 </TouchableOpacity>
               </View>
             ) : (
               <View style={styles.loadingSection}>
                 <ActivityIndicator size="large" color="#007AFF" />
                 <Text style={styles.loadingText}>Generating your {activeTab} cosmic profile...</Text>
               </View>
             )}

             {/* Strengths */}
             {getCurrentSignInfo().signDescription?.strengths && getCurrentSignInfo().signDescription!.strengths.length > 0 && (
               <View style={styles.strengthsSection}>
                 <Text style={styles.sectionTitle}>✨ Your Cosmic Strengths</Text>
                 {getCurrentSignInfo().signDescription!.strengths.map((strength: string, index: number) => (
                   <View key={index} style={styles.listItem}>
                     <Text style={styles.bulletPoint}>•</Text>
                     <Text style={styles.listText}>{strength}</Text>
                   </View>
                 ))}
               </View>
             )}

             {/* Challenges */}
             {getCurrentSignInfo().signDescription?.challenges && getCurrentSignInfo().signDescription!.challenges.length > 0 && (
               <View style={styles.challengesSection}>
                 <Text style={styles.sectionTitle}>🌙 Growth Opportunities</Text>
                 {getCurrentSignInfo().signDescription!.challenges.map((challenge: string, index: number) => (
                   <View key={index} style={styles.listItem}>
                     <Text style={styles.bulletPoint}>•</Text>
                     <Text style={styles.listText}>{challenge}</Text>
                   </View>
                 ))}
               </View>
             )}

             {/* Advice */}
             {/* {getCurrentSignInfo().signDescription?.advice && (
               <View style={styles.adviceSection}>
                 <Text style={styles.sectionTitle}>🌟 Cosmic Guidance</Text>
                 <View style={styles.adviceContainer}>
                   <Text style={styles.adviceText}>"{getCurrentSignInfo().signDescription!.advice}"</Text>
                 </View>
               </View>
             )} */}

            {/* All Signs Overview */}
            {/* <View style={styles.allSignsSection}>
              <Text style={styles.sectionTitle}>🔮 Your Complete Astrological Profile</Text>
              <View style={styles.signsGrid}>
                <View style={styles.signCard}>
                  <Text style={styles.signCardTitle}>Western</Text>
                  <Text style={styles.signCardValue}>{astrology.westernSign}</Text>
                </View>
                <View style={styles.signCard}>
                  <Text style={styles.signCardTitle}>Chinese</Text>
                  <Text style={styles.signCardValue}>{astrology.chineseSign}</Text>
                </View>
                <View style={styles.signCard}>
                  <Text style={styles.signCardTitle}>Vedic</Text>
                  <Text style={styles.signCardValue}>{astrology.vedicSign}</Text>
                </View>
              </View>
            </View> */}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewIcon: {
    fontSize: 24,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  previewArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  previewDescription: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  signTabs: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  signTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signTabActive: {
    backgroundColor: '#007AFF',
  },
  signTabLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  signTabLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  signTabValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  signTabValueActive: {
    color: '#fff',
  },
  checkmark: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSignTabs: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  modalSignTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalSignTabActive: {
    backgroundColor: '#007AFF',
  },
  modalSignTabLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 6,
    fontWeight: '500',
  },
  modalSignTabLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalSignTabValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  modalSignTabValueActive: {
    color: '#fff',
  },
  modalCheckmark: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  signHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signEmoji: {
    fontSize: 60,
    marginBottom: 12,
    textAlign: 'center',
  },
  signTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  signSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  descriptionSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    textAlign: 'justify',
  },
  errorSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  strengthsSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengesSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adviceSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
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
  allSignsSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  signCardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  signCardValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
