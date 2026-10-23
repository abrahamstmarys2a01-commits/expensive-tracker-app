import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { User, Camera, Mail, Phone, MapPin } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '../utils/api';

const ProfileSetupScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profileImage: user?.profileImage || null
  });

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      };

      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery permission is required.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setForm({ ...form, profileImage: base64Image });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const openImagePickerOptions = () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: () => pickImage(true) },
      { text: 'Choose from Gallery', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      Alert.alert('Required Fields', 'Please fill in all fields to continue.');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateProfile({
        name: form.name,
        phone: form.phone,
        address: form.address,
        profileImage: form.profileImage,
      });
      await updateUser(response);
      
      // We don't manually navigate here because AppNavigator will detect
      // isProfileComplete is true and automatically switch to TabNavigator.
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete profile setup');
      setIsUpdating(false); // Only set false on error, success unmounts screen
    } 
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Complete Your Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please provide your details to get started with Expensive Tracker.
          </Text>
        </View>

        <View style={styles.photoUploadContainer}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.border }]}>
            {form.profileImage ? (
              <Image source={{ uri: form.profileImage }} style={styles.avatarImage} />
            ) : (
              <User color={colors.textSecondary} size={48} />
            )}
          </View>
          <TouchableOpacity style={[styles.photoUploadButton, { backgroundColor: colors.primaryLight }]} onPress={openImagePickerOptions}>
            <Camera color={colors.primary} size={18} />
            <Text style={[styles.photoUploadText, { color: colors.primary }]}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={form.name}
            onChangeText={(text) => setForm({...form, name: text})}
            placeholder="Enter your name"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={form.phone}
            onChangeText={(text) => setForm({...form, phone: text})}
            placeholder="e.g. +1 234 567 8900"
            keyboardType="phone-pad"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={form.address}
            onChangeText={(text) => setForm({...form, address: text})}
            placeholder="Enter your full address"
            multiline={true}
            numberOfLines={3}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveProfile}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.background }]}>Complete Setup</Text>
          )}
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  photoUploadText: {
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 15,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ProfileSetupScreen;
