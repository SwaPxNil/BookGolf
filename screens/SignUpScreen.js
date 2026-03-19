import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegister } from '../hooks/useAuth';

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please complete all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirm password must match.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role: 'user',
      });

      Alert.alert('Success', 'Account created. You can now log in.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create account.';
      Alert.alert('Sign up failed', String(message));
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start using the app</Text>

          <TextInput
            placeholder="Full name"
            placeholderTextColor="#7d7d7d"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#7d7d7d"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#7d7d7d"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.inputWithIcon}
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

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="#7d7d7d"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.inputWithIcon}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#5f6a44"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, registerMutation.isPending && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={registerMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {registerMutation.isPending ? 'Creating...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Back to login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e7e2d3',
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  title: {
    fontSize: 34,
    color: '#1f251f',
    fontFamily: 'Bebas',
    letterSpacing: 0.6,
  },
  subtitle: {
    marginTop: 3,
    marginBottom: 20,
    color: '#304233',
    fontSize: 17,
    fontFamily: 'Abel',
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7c1ac',
    backgroundColor: '#fffdf6',
    borderRadius: 12,
    marginBottom: 12,
    paddingLeft: 14,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 11,
    paddingRight: 6,
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
    marginTop: 5,
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
