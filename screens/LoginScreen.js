import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLogin, useRefreshToken } from '../hooks/useAuth';
import { saveAuthTokens } from '../api/tokenStorage';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const refreshTokenMutation = useRefreshToken();

  const extractTokens = (response) => {
    const payload = response?.data?.data ?? response?.data ?? {};
    return {
      accessToken:
        payload?.access_token || payload?.accessToken || null,
      refreshToken:
        payload?.refresh_token || payload?.refreshToken || null,
      tempToken:
        payload?.temp_token || payload?.tempToken || null,
    };
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({ email: email.trim(), password });
      const { accessToken, refreshToken, tempToken: maybeTempToken } = extractTokens(response);

      if (maybeTempToken) {
        navigation.navigate('Verify2FA', {
          tempToken: maybeTempToken,
          email: email.trim(),
        });
        return;
      }

      let resolvedAccessToken = accessToken;
      let resolvedRefreshToken = refreshToken;

      if (!resolvedAccessToken && resolvedRefreshToken) {
        const refreshedResponse = await refreshTokenMutation.mutateAsync({
          refresh_token: resolvedRefreshToken,
        });
        const refreshedTokens = extractTokens(refreshedResponse);
        resolvedAccessToken = refreshedTokens.accessToken || resolvedAccessToken;
        resolvedRefreshToken = refreshedTokens.refreshToken || resolvedRefreshToken;
      }

      if (!resolvedAccessToken) {
        Alert.alert('Login failed', 'No access token was returned by the server.');
        return;
      }

      await saveAuthTokens({
        accessToken: resolvedAccessToken,
        refreshToken: resolvedRefreshToken,
      });
      onLoginSuccess?.();
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login failed', String(message));
    }
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalCard}
      >
        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Ionicons name="golf-outline" size={16} color="#1f251f" />
            <Text style={styles.badgeText}>Golf Booking</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your next round</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#5f6a44" style={styles.inputIcon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#7d7d7d"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#5f6a44" style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#7d7d7d"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#5f6a44"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            loginMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {loginMutation.isPending
              ? 'Logging in...'
              : 'Continue'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.otpHint}>2FA code will be verified on the next page.</Text>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>No account yet? Sign up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 26, 18, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#f3f0e4',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#d4ceb8',
    shadowColor: '#111',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 14,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ccd3b9',
    backgroundColor: '#e7ecd8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: 'Abel',
    color: '#2a3428',
    fontSize: 14,
  },
  title: {
    fontSize: 34,
    fontFamily: 'Bebas',
    color: '#1f251f',
    letterSpacing: 0.8,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    fontFamily: 'Abel',
    color: '#304233',
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7c1ac',
    backgroundColor: '#fffdf6',
    borderRadius: 12,
    marginBottom: 12,
    paddingLeft: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 11,
    fontSize: 16,
    color: '#1f251f',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#798d3d',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#192016',
    fontFamily: 'Bebas',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  otpHint: {
    marginTop: 10,
    textAlign: 'center',
    color: '#57624a',
    fontFamily: 'Abel',
    fontSize: 14,
  },
  linkText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#304233',
    fontFamily: 'Abel',
    fontSize: 17,
  },
});
