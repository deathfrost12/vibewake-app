import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth-store';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    loading,
    error,
    clearError,
    emailVerificationSent,
    emailVerificationLoading,
    resendEmailVerification,
  } = useAuthStore();

  // Clear error when component mounts or user starts typing
  React.useEffect(() => {
    clearError();
  }, [clearError]);

  React.useEffect(() => {
    if (email || password || confirmPassword || fullName) {
      clearError();
    }
  }, [email, password, confirmPassword, fullName, clearError]);

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Chyba', 'Zadejte prosím své celé jméno');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Chyba', 'Zadejte prosím email');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Chyba', 'Heslo musí mít alespoň 6 znaků');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Chyba', 'Hesla se neshodují');
      return false;
    }

    return true;
  };

  const handleEmailRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await signUpWithEmail(
      email.trim(),
      password,
      fullName.trim()
    );
    setIsLoading(false);

    if (result.success) {
      if (result.needsVerification) {
        Alert.alert(
          'Ověření emailu',
          'Registrace proběhla úspěšně! Zkontrolujte svou emailovou schránku a klikněte na ověřovací odkaz.',
          [{ text: 'OK' }]
        );
      } else {
        // Immediately signed in
        router.replace('/(tabs)/dashboard');
      }
    }
    // Error will be shown via error state
  };

  const handleGoogleRegister = async () => {
    const result = await signInWithGoogle();

    if (result.success) {
      // Will redirect or be handled by auth listener
      router.replace('/(tabs)/dashboard');
    }
    // Error will be shown via error state
  };

  const handleAppleRegister = async () => {
    const result = await signInWithApple();

    if (result.success) {
      router.replace('/(tabs)/dashboard');
    }
    // Error will be shown via error state
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      Alert.alert('Chyba', 'Zadejte email pro opětovné odeslání ověření');
      return;
    }

    const result = await resendEmailVerification(email.trim());

    if (result.success) {
      Alert.alert('Email odeslán', 'Ověřovací email byl znovu odeslán', [
        { text: 'OK' },
      ]);
    } else {
      Alert.alert(
        'Chyba',
        result.error || 'Nepodařilo se odeslat ověřovací email'
      );
    }
  };

  const isFormLoading = loading || isLoading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-secondary-800 mb-2">
              Vytvořte účet
            </Text>
            <Text className="text-base text-secondary-500 text-center">
              Zaregistrujte se a začněte efektivně studovat
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {/* Email Verification Message */}
          {emailVerificationSent && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
              <Text className="text-green-600 text-sm mb-2">
                Ověřovací email byl odeslán! Zkontrolujte svou emailovou
                schránku.
              </Text>
              <TouchableOpacity
                onPress={handleResendVerification}
                disabled={emailVerificationLoading}
              >
                <Text className="text-green-600 text-sm font-semibold">
                  {emailVerificationLoading ? 'Odesílání...' : 'Odeslat znovu'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Full Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-secondary-700 mb-1.5">
              Celé jméno
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-white"
              placeholder="Jan Novák"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              editable={!isFormLoading}
            />
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-secondary-700 mb-1.5">
              Email
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-white"
              placeholder="váš-email@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoComplete="email"
              editable={!isFormLoading}
            />
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-secondary-700 mb-1.5">
              Heslo
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-lg p-3 pr-12 text-base bg-white"
                placeholder="Alespoň 6 znaků"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!isFormLoading}
              />
              <TouchableOpacity
                className="absolute right-3 top-3 p-1"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isFormLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-secondary-700 mb-1.5">
              Potvrdit heslo
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-lg p-3 pr-12 text-base bg-white"
                placeholder="Zadejte heslo znovu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!isFormLoading}
              />
              <TouchableOpacity
                className="absolute right-3 top-3 p-1"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isFormLoading}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Email Register Button */}
          <TouchableOpacity
            className={`rounded-lg p-4 items-center mb-4 ${
              isFormLoading ? 'bg-gray-400' : 'bg-primary'
            }`}
            onPress={handleEmailRegister}
            disabled={isFormLoading}
          >
            {isFormLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Vytvořit účet
              </Text>
            )}
          </TouchableOpacity>

          {/* Social Login Divider */}
          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-secondary-500 text-sm">nebo</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Register Button */}
          <TouchableOpacity
            className="border border-gray-300 rounded-lg p-4 items-center mb-3 bg-white flex-row justify-center"
            onPress={handleGoogleRegister}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text className="text-secondary-700 text-base font-semibold ml-2">
              {loading ? 'Registrace...' : 'Registrovat s Google'}
            </Text>
          </TouchableOpacity>

          {/* Apple Register Button */}
          <TouchableOpacity
            className="bg-black rounded-lg p-4 items-center mb-6 flex-row justify-center"
            onPress={handleAppleRegister}
            disabled={loading}
          >
            <Ionicons name="logo-apple" size={20} color="#ffffff" />
            <Text className="text-white text-base font-semibold ml-2">
              {loading ? 'Registrace...' : 'Registrovat s Apple'}
            </Text>
          </TouchableOpacity>

          {/* Terms and Privacy */}
          <Text className="text-xs text-secondary-500 text-center mb-6 leading-5">
            Registrací souhlasíte s našimi{' '}
            <Text className="text-primary font-semibold">
              Obchodními podmínkami
            </Text>{' '}
            a{' '}
            <Text className="text-primary font-semibold">
              Zásadami ochrany osobních údajů
            </Text>
          </Text>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-secondary-500 text-sm">Už máte účet? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity disabled={isFormLoading}>
                <Text className="text-primary text-sm font-semibold">
                  Přihlásit se
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
