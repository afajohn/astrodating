import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { ProfileService, UserProfile } from '../services/ProfileService';

interface ProfileEditScreenProps {
  onBack: () => void;
}

export const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: 'Philippines' as 'Philippines' | 'Thailand',
    gender: 'male' as 'male' | 'female',
    seeking: 'female' as 'male' | 'female',
    birthDate: '',
    bio: '',
    maritalStatus: 'single' as 'single' | 'divorced' | 'widowed',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await ProfileService.getCurrentProfile();
      
      if (error) {
        Alert.alert('Error', 'Failed to load profile');
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          country: data.country || 'Philippines',
          gender: data.gender || 'male',
          seeking: data.seeking || 'female',
          birthDate: data.birth_date || '',
          bio: data.bio || '',
          maritalStatus: data.marital_status || 'single',
        });

        // Set date picker to current birth date
        if (data.birth_date) {
          setSelectedDate(new Date(data.birth_date));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    
    // Format date as YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, birthDate: formattedDate }));
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await ProfileService.updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        country: formData.country,
        gender: formData.gender,
        seeking: formData.seeking,
        birth_date: formData.birthDate,
        bio: formData.bio,
        marital_status: formData.maritalStatus,
      });

      if (error) {
        console.error('Profile update error:', error);
        Alert.alert('Error', `Failed to update profile: ${error.message || 'Unknown error'}`);
        return;
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
        </View>

      <View style={styles.form}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="First name"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Last name"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Birth Date</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={showDatePickerModal}>
              <Text style={[styles.datePickerText, !formData.birthDate && styles.datePickerPlaceholder]}>
                {formData.birthDate || 'Select your birth date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.buttonOption,
                    formData.gender === 'male' && styles.buttonOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', 'male')}
                >
                  <Text
                    style={[
                      styles.buttonOptionText,
                      formData.gender === 'male' && styles.buttonOptionTextSelected,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.buttonOption,
                    formData.gender === 'female' && styles.buttonOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', 'female')}
                >
                  <Text
                    style={[
                      styles.buttonOptionText,
                      formData.gender === 'female' && styles.buttonOptionTextSelected,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Seeking</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.buttonOption,
                    formData.seeking === 'male' && styles.buttonOptionSelected,
                  ]}
                  onPress={() => handleInputChange('seeking', 'male')}
                >
                  <Text
                    style={[
                      styles.buttonOptionText,
                      formData.seeking === 'male' && styles.buttonOptionTextSelected,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.buttonOption,
                    formData.seeking === 'female' && styles.buttonOptionSelected,
                  ]}
                  onPress={() => handleInputChange('seeking', 'female')}
                >
                  <Text
                    style={[
                      styles.buttonOptionText,
                      formData.seeking === 'female' && styles.buttonOptionTextSelected,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Country</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.buttonOption,
                  formData.country === 'Philippines' && styles.buttonOptionSelected,
                ]}
                onPress={() => handleInputChange('country', 'Philippines')}
              >
                <Text
                  style={[
                    styles.buttonOptionText,
                    formData.country === 'Philippines' && styles.buttonOptionTextSelected,
                  ]}
                >
                  Philippines
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttonOption,
                  formData.country === 'Thailand' && styles.buttonOptionSelected,
                ]}
                onPress={() => handleInputChange('country', 'Thailand')}
              >
                <Text
                  style={[
                    styles.buttonOptionText,
                    formData.country === 'Thailand' && styles.buttonOptionTextSelected,
                  ]}
                >
                  Thailand
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About You</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerPlaceholder: {
    color: '#999',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonOption: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  buttonOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonOptionText: {
    fontSize: 14,
    color: '#666',
  },
  buttonOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
