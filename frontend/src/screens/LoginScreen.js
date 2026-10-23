import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { loginUser, registerUser } from '../utils/api';
import { Eye, EyeOff } from 'lucide-react-native';

const LoginScreen = () => {
  const { login } = useAuth();
  const { colors } = useTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!isLogin && !name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await loginUser(username.toLowerCase(), password);
      } else {
        data = await registerUser(name, username.toLowerCase(), password);
      }
      
      // Store token and set auth state
      await login(data);
    } catch (error) {
      console.error('Login Error:', error.message);
      Alert.alert(
        isLogin ? 'Login Failed' : 'Registration Failed', 
        `Error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>Expensive Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track Today, Save Tomorrow</Text>
      </View>

      <View style={styles.formContainer}>
        {!isLogin && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
              ]}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Username</Text>
        <TextInput
          style={[
            styles.input, 
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
          ]}
          placeholder="Enter your username"
          placeholderTextColor={colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          keyboardType="default"
        />

        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <View style={[
          styles.passwordContainer, 
          { backgroundColor: colors.surface, borderColor: colors.border }
        ]}>
          <TextInput
            style={[
              styles.passwordInput, 
              { color: colors.text }
            ]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={22} color={colors.textSecondary} />
            ) : (
              <Eye size={22} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.loginButtonText, { color: colors.background }]}>
              {isLogin ? 'Login' : 'Register'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={[styles.switchButtonText, { color: colors.textSecondary }]}>
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 8,
  },
  loginButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  }
});

export default LoginScreen;
