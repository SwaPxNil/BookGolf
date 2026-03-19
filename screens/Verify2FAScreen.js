import React, { useEffect, useState } from 'react';
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
import { useResend2FA, useVerify2FA } from '../hooks/useAuth';
import { saveAuthTokens } from '../api/tokenStorage';

export default function Verify2FAScreen({ navigation, route, onLoginSuccess }) {
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [tempTokenState, setTempTokenState] = useState(route?.params?.tempToken || null);
  const verify2FAMutation = useVerify2FA();
  const resend2FAMutation = useResend2FA();
  const userEmail = route?.params?.email;

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const extractTokens = (response) => {
    const payload = response?.data?.data ?? response?.data ?? {};
    return {
      accessToken: payload?.access_token || payload?.accessToken || null,
      refreshToken: payload?.refresh_token || payload?.refreshToken || null,
    };
  };

  const handleVerify2FA = async () => {
    if (!tempTokenState) {
      Alert.alert('Session expired', 'Please log in again.');
      navigation.replace('Login');
      return;
    }

    if (!twoFactorCode.trim()) {
      Alert.alert('Missing code', 'Enter your 2FA code to continue.');
      return;
    }

    try {
      const verifyResponse = await verify2FAMutation.mutateAsync({
        temp_token: tempTokenState,
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
      const message = error?.response?.data?.message || error?.response?.data?.msg || '2FA verification failed.';
      Alert.alert('Verification failed', String(message));
    }
  };

  const handleResendCode = async () => {
    if (!tempTokenState) {
      Alert.alert('Session expired', 'Please log in again.');
      navigation.replace('Login');
      return;
    }

    try {
      const resendResponse = await resend2FAMutation.mutateAsync({
        temp_token: tempTokenState,
      });

      const payload = resendResponse?.data?.data ?? resendResponse?.data ?? {};
      const renewedTempToken = payload?.temp_token || payload?.tempToken || null;
      if (renewedTempToken) {
        setTempTokenState(renewedTempToken);
      }

      setCountdown(60);
      Alert.alert('Code sent', 'A new OTP has been sent to your email.');
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.msg || 'Could not resend OTP right now.';
      Alert.alert('Resend failed', String(message));
    }
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalCard}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#2a3428" />
        </TouchableOpacity>

        <View style={styles.badgePill}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#1f251f" />
          <Text style={styles.badgeText}>2FA Verification</Text>
        </View>

        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          {userEmail ? `Code sent to ${userEmail}` : 'Use the code sent to your email'}
        </Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="keypad-outline" size={18} color="#5f6a44" style={styles.inputIcon} />
          <TextInput
            placeholder="6-digit code"
            placeholderTextColor="#7d7d7d"
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, verify2FAMutation.isPending && styles.buttonDisabled]}
          onPress={handleVerify2FA}
          disabled={verify2FAMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {verify2FAMutation.isPending ? 'Verifying...' : 'Verify & Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendRow}
          onPress={handleResendCode}
          disabled={countdown > 0 || resend2FAMutation.isPending}
        >
          <Text
            style={[
              styles.resendText,
              (countdown > 0 || resend2FAMutation.isPending) && styles.resendTextDisabled,
            ]}
          >
            {resend2FAMutation.isPending
              ? 'Resending...'
              : countdown > 0
              ? `Resend OTP in ${countdown}s`
              : 'Resend OTP'}
          </Text>
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
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#e7ecd8',
  },
  badgePill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ccd3b9',
    backgroundColor: '#e7ecd8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: 'Abel',
    color: '#2a3428',
    fontSize: 14,
  },
  title: {
    marginTop: 10,
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
    fontSize: 18,
    color: '#1f251f',
    letterSpacing: 1.2,
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
  resendRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  resendText: {
    color: '#304233',
    fontFamily: 'Abel',
    fontSize: 16,
  },
  resendTextDisabled: {
    color: '#8b8b8b',
  },
});
