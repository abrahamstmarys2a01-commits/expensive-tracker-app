import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Image, ActivityIndicator } from 'react-native';
import { clearAllExpenses } from '../utils/storage';
import { Moon, Trash2, ChevronRight, LogOut, User, Mail, Phone, MapPin, Edit3, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '../utils/api';

const SettingsScreen = () => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { user, logout, updateUser } = useAuth();
  
  // Edit Profile State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profileImage: user?.profileImage || null
  });

  const handleToggleDark = async (value) => {
    await toggleTheme(value);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Expenses',
      'Are you sure you want to delete all stored expenses? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllExpenses();
            Alert.alert('Success', 'All expenses have been cleared.');
          },
        },
      ]
    );
  };

  // Image Picker Logic
  const pickImage = async (useCamera = false) => {
    try {
      let result;
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // We need base64 to send to backend
      };

      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setEditForm({ ...editForm, profileImage: base64Image });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const openImagePickerOptions = () => {
    Alert.alert('Select Photo', 'Choose an option', [
      { text: 'Camera', onPress: () => pickImage(true) },
      { text: 'Gallery', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await updateProfile({
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address,
        profileImage: editForm.profileImage,
      });
      await updateUser(response);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderSettingItem = ({ icon: Icon, title, rightElement, onPress, destructive }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.border + '50' }, destructive && { backgroundColor: colors.danger + '20' }]}>
          <Icon color={destructive ? colors.danger : colors.textSecondary} size={20} />
        </View>
        <Text style={[styles.settingTitle, { color: colors.text }, destructive && { color: colors.danger }]}>{title}</Text>
      </View>
      <View>{rightElement || (onPress && <ChevronRight color={colors.border} size={20} />)}</View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      
      {/* PROFILE CARD */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Customer Profile</Text>
        <TouchableOpacity onPress={() => {
          setEditForm({
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || '',
            profileImage: user?.profileImage || null
          });
          setEditModalVisible(true);
        }} style={styles.editButton}>
          <Edit3 color={colors.primary} size={16} />
          <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.card, styles.profileCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <User color={colors.primary} size={32} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'Customer Name'}</Text>
            <Text style={[styles.profileRole, { color: colors.textSecondary }]}>Premium Member</Text>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 0, marginVertical: 16 }]} />
        
        <View style={styles.profileDetailRow}>
          <Mail color={colors.textSecondary} size={18} style={styles.profileIcon} />
          <Text style={[styles.profileDetailText, { color: colors.text }]}>{user?.email || 'email@example.com'}</Text>
        </View>
        
        <View style={styles.profileDetailRow}>
          <Phone color={colors.textSecondary} size={18} style={styles.profileIcon} />
          <Text style={[styles.profileDetailText, { color: colors.text }]}>{user?.phone || 'Not provided'}</Text>
        </View>
        
        <View style={styles.profileDetailRow}>
          <MapPin color={colors.textSecondary} size={18} style={styles.profileIcon} />
          <Text style={[styles.profileDetailText, { color: colors.text }]} numberOfLines={2}>
            {user?.address || 'Not provided'}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        {renderSettingItem({
          icon: Moon,
          title: 'Dark Mode',
          rightElement: (
            <Switch
              value={isDark}
              onValueChange={handleToggleDark}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          )
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data Management</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        {renderSettingItem({
          icon: Trash2,
          title: 'Clear All Expenses',
          onPress: handleClearData,
          destructive: true,
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account Actions</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        {renderSettingItem({
          icon: LogOut,
          title: 'Logout',
          onPress: logout,
          destructive: true,
        })}
      </View>
      
      <View style={{ height: 40 }} />

      {/* EDIT PROFILE MODAL */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              
              <View style={styles.photoUploadContainer}>
                <View style={[styles.modalAvatarContainer, { backgroundColor: colors.border }]}>
                  {editForm.profileImage ? (
                    <Image source={{ uri: editForm.profileImage }} style={styles.modalAvatarImage} />
                  ) : (
                    <User color={colors.textSecondary} size={40} />
                  )}
                </View>
                <TouchableOpacity style={[styles.photoUploadButton, { backgroundColor: colors.primaryLight }]} onPress={openImagePickerOptions}>
                  <Camera color={colors.primary} size={18} />
                  <Text style={[styles.photoUploadText, { color: colors.primary }]}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editForm.name}
                onChangeText={(text) => setEditForm({...editForm, name: text})}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editForm.phone}
                onChangeText={(text) => setEditForm({...editForm, phone: text})}
                placeholder="e.g. +1 234 567 8900"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editForm.address}
                onChangeText={(text) => setEditForm({...editForm, address: text})}
                placeholder="Enter your address"
                multiline={true}
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: colors.background }]}>Save Changes</Text>
                )}
              </TouchableOpacity>
              
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  editButtonText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  profileCard: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  profileDetailText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalAvatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoUploadText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SettingsScreen;
