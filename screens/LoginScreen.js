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
import { useLogin, useRefreshToken, useVerify2FA } from '../hooks/useAuth';
import { saveAuthTokens } from '../api/tokenStorage';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const loginMutation = useLogin();
  const verify2FAMutation = useVerify2FA();
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
        setTempToken(maybeTempToken);
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

  const handleVerify2FA = async () => {
    if (!twoFactorCode.trim() || !tempToken) {
      Alert.alert('Missing code', 'Enter your 2FA code to continue.');
      return;
    }
    try {
      const verifyResponse = await verify2FAMutation.mutateAsync({
        temp_token: tempToken,
        two_factor_code: twoFactorCode.trim(),
      });
      const { accessToken, refreshToken } = extractTokens(verifyResponse);
      if (!accessToken) {
        Alert.alert('Verification failed', 'No access token was returned by the server.');
        return;
      }
      await saveAuthTokens({ accessToken, refreshToken });
      onLoginSuccess?.();
    } catch (error) {
      const message = error?.response?.data?.message || '2FA verification failed.';
      Alert.alert('Verification failed', String(message));
    }
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalCard}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue to your homepage</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#7d7d7d"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#7d7d7d"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        {tempToken ? (
          <TextInput
            placeholder="2FA code"
            placeholderTextColor="#7d7d7d"
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            keyboardType="number-pad"
            style={styles.input}
          />
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            (loginMutation.isPending || verify2FAMutation.isPending) && styles.buttonDisabled,
          ]}
          onPress={tempToken ? handleVerify2FA : handleLogin}
          disabled={loginMutation.isPending || verify2FAMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {tempToken
              ? verify2FAMutation.isPending
                ? 'Verifying...'
                : 'Verify 2FA'
              : loginMutation.isPending
              ? 'Logging in...'
              : 'Log In'}
          </Text>
        </TouchableOpacity>

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
    padding: 22,
    borderWidth: 1,
    borderColor: '#d4ceb8',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Bebas',
    color: '#1f251f',
    letterSpacing: 0.6,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    fontFamily: 'Abel',
    color: '#304233',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#c7c1ac',
    backgroundColor: '#fffdf6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
    fontSize: 16,
    color: '#1f251f',
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
  linkText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#304233',
    fontFamily: 'Abel',
    fontSize: 17,
  },
});
