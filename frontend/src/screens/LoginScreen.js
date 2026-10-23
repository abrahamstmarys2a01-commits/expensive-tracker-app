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
  ActivityIndicator,
  ScrollView,
  StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../utils/api';
import { User, Lock, Eye, EyeOff, ArrowRight, UserCheck } from 'lucide-react-native';

const DotGrid = ({ style }) => (
  <View style={[styles.dotGrid, style]}>
    {[0, 1, 2].map((row) => (
      <View key={row} style={styles.dotRow}>
        {[0, 1, 2].map((col) => (
          <View key={col} style={styles.dot} />
        ))}
      </View>
    ))}
  </View>
);

const LoginScreen = () => {
  const { login } = useAuth();
  
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
        error.message || 'Check your credentials or network connection'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#070c16" />
      
      {/* Ambient background glows */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />
      <View style={styles.accentWaveTop} />
      <View style={styles.accentWaveBottom} />

      {/* Decorative Dot Grids */}
      <DotGrid style={styles.dotGridTopRight} />
      <DotGrid style={styles.dotGridBottomLeft} />

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Card */}
          <View style={styles.logoSection}>
            <View style={styles.logoCard}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Title with Trending Arrow */}
            <View style={styles.titleRow}>
              <Text style={styles.titleWhite}>Expensive </Text>
              <Text style={styles.titleGreen}>Tracker</Text>
              <Text style={styles.titleArrow}>↗</Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>Track Today, Save Tomorrow</Text>

            {/* Green Indicator Pill */}
            <View style={styles.indicatorPill} />
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputCard}>
                <View style={styles.iconCircle}>
                  <UserCheck size={20} color="#00e676" />
                </View>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.inputText}
                    placeholder="Enter your name"
                    placeholderTextColor="#475569"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            {/* Username Input Card */}
            <View style={styles.inputCard}>
              <View style={styles.iconCircle}>
                <User size={20} color="#00e676" />
              </View>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.inputText}
                  placeholder="Enter username"
                  placeholderTextColor="#475569"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input Card */}
            <View style={[styles.inputCard, styles.inputCardMargin]}>
              <View style={styles.iconCircle}>
                <Lock size={20} color="#00e676" />
              </View>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.inputText}
                  placeholder="Enter password"
                  placeholderTextColor="#475569"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={22} color="#64748b" />
                ) : (
                  <Eye size={22} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>

            {/* Login / Register Button */}
            <TouchableOpacity 
              style={styles.loginBtn}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <View style={styles.btnIconCircle}>
                    <ArrowRight size={18} color="#ffffff" strokeWidth={3} />
                  </View>
                  <Text style={styles.loginBtnText}>
                    {isLogin ? 'Login' : 'Register'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Toggle Switch */}
            <TouchableOpacity 
              style={styles.switchSection} 
              onPress={() => setIsLogin(!isLogin)}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.switchHighlight}>
                  {isLogin ? 'Register' : 'Login'}
                </Text>
              </Text>
              <View style={styles.switchUnderline} />
            </TouchableOpacity>
          </View>

          {/* Bottom Financial Chart Graphic */}
          <View style={styles.bottomGraphicContainer}>
            <Image 
              source={require('../../assets/images/bottom_chart.jpg')}
              style={styles.bottomGraphicImage}
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#070c16',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  glowTopLeft: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 230, 118, 0.14)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 200, 83, 0.14)',
  },
  accentWaveTop: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 28,
    borderColor: 'rgba(0, 230, 118, 0.08)',
  },
  accentWaveBottom: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 36,
    borderColor: 'rgba(0, 230, 118, 0.08)',
  },
  dotGrid: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  dotGridTopRight: {
    top: 36,
    right: 28,
  },
  dotGridBottomLeft: {
    bottom: 40,
    left: 28,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00e676',
    opacity: 0.45,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoCard: {
    width: 116,
    height: 116,
    borderRadius: 30,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 22,
  },
  logoImage: {
    width: 98,
    height: 98,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  titleWhite: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  titleGreen: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00e676',
    letterSpacing: 0.5,
  },
  titleArrow: {
    fontSize: 26,
    fontWeight: '900',
    color: '#00e676',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8291a5',
    letterSpacing: 1.5,
  },
  indicatorPill: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00e676',
    marginTop: 12,
    marginBottom: 16,
  },
  formContainer: {
    width: '100%',
    marginTop: 6,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1.2,
    borderColor: '#1e293b',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inputCardMargin: {
    marginTop: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a2436',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  inputText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    padding: 0,
    margin: 0,
  },
  eyeBtn: {
    padding: 8,
    marginLeft: 6,
  },
  loginBtn: {
    backgroundColor: '#00e676',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  btnIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00a850',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  loginBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  switchSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  switchHighlight: {
    color: '#00e676',
    fontWeight: '700',
  },
  switchUnderline: {
    width: 36,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00e676',
    marginTop: 6,
  },
  bottomGraphicContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  bottomGraphicImage: {
    width: '100%',
    height: 125,
    opacity: 0.9,
  },
});

export default LoginScreen;
