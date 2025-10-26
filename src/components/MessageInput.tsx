import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ImageUploadService } from '../services/ImageUploadService';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendImage?: (imageUrl: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onSendImage,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    console.log('MessageInput: Attempting to send message:', { trimmedMessage, disabled });
    
    if (trimmedMessage.length === 0) {
      console.log('MessageInput: Message is empty, not sending');
      return;
    }

    if (trimmedMessage.length > 1000) {
      Alert.alert('Message too long', 'Messages must be 1000 characters or less.');
      return;
    }

    console.log('MessageInput: Calling onSendMessage with:', trimmedMessage);
    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter' && Platform.OS === 'web') {
      handleSend();
    }
  };

  const handleImagePicker = async () => {
    try {
      console.log('MessageInput: Opening image picker');
      setUploadingImage(true);
      
      const result = await ImageUploadService.showImagePickerOptions();
      
      if (result && !result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('MessageInput: Image selected:', imageUri);
        
        // Upload image
        const uploadResult = await ImageUploadService.uploadImage(imageUri);
        
        if (uploadResult.success && uploadResult.url) {
          console.log('MessageInput: Image uploaded successfully:', uploadResult.url);
          onSendImage?.(uploadResult.url);
        } else {
          console.error('MessageInput: Image upload failed:', uploadResult.error);
          Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload image');
        }
      } else {
        console.log('MessageInput: Image picker canceled');
      }
    } catch (error) {
      console.error('MessageInput: Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[
            styles.imageButton,
            (disabled || uploadingImage) && styles.imageButtonDisabled
          ]}
          onPress={handleImagePicker}
          disabled={disabled || uploadingImage}
        >
          <Text style={[
            styles.imageButtonText,
            (disabled || uploadingImage) && styles.imageButtonTextDisabled
          ]}>
            {uploadingImage ? '📤' : '📎'}
          </Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#999999"
          value={message}
          onChangeText={setMessage}
          onKeyPress={handleKeyPress}
          multiline
          maxLength={1000}
          editable={!disabled}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (message.trim().length === 0 || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={message.trim().length === 0 || disabled}
        >
          <Text style={[
            styles.sendButtonText,
            (message.trim().length === 0 || disabled) && styles.sendButtonTextDisabled
          ]}>
            Send ➦
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  imageButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  imageButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  imageButtonTextDisabled: {
    color: '#999999',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F8F8F8',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#999999',
  },
});
