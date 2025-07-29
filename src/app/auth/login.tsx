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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    loading,
    error,
    clearError,
    passwordResetSent,
    resetPassword,
    passwordResetLoading,
  } = useAuthStore();

  // Clear error when component mounts or user starts typing
  React.useEffect(() => {
    clearError();
  }, [clearError]);

  React.useEffect(() => {
    if (email || password) {
      clearError();
    }
  }, [email, password, clearError]);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Chyba', 'Prosím vyplňte email a heslo');
      return;
    }

    setIsLoading(true);
    const result = await signInWithEmail(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)/dashboard');
    } else {
      // Error will be shown via error state
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();

    if (result.success) {
      // Will redirect or be handled by auth listener
      router.replace('/(tabs)/dashboard');
    }
    // Error will be shown via error state
  };

  const handleAppleLogin = async () => {
    const result = await signInWithApple();

    if (result.success) {
      router.replace('/(tabs)/dashboard');
    }
    // Error will be shown via error state
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Email je potřeba',
        'Prosím zadejte svůj email adresu pro obnovení hesla',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await resetPassword(email.trim());

    if (result.success) {
      Alert.alert(
        'Email odeslán',
        'Instrukce pro obnovení hesla byly odeslány na váš email',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Chyba', result.error || 'Nepodařilo se odeslat email');
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
              Vítejte zpět
            </Text>
            <Text className="text-base text-secondary-500 text-center">
              Přihlaste se do svého účtu Repetito
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {/* Password Reset Success */}
          {passwordResetSent && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
              <Text className="text-green-600 text-sm">
                Email s instrukcemi pro obnovení hesla byl odeslán
              </Text>
            </View>
          )}

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
          <View className="mb-5">
            <Text className="text-sm font-semibold text-secondary-700 mb-1.5">
              Heslo
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-lg p-3 pr-12 text-base bg-white"
                placeholder="Vaše heslo"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
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

          {/* Forgot Password Link */}
          <TouchableOpacity
            className="self-end mb-6"
            onPress={handleForgotPassword}
            disabled={passwordResetLoading || isFormLoading}
          >
            <Text className="text-primary text-sm font-semibold">
              {passwordResetLoading ? 'Odesílání...' : 'Zapomněli jste heslo?'}
            </Text>
          </TouchableOpacity>

          {/* Email Login Button */}
          <TouchableOpacity
            className={`rounded-lg p-4 items-center mb-4 ${
              isFormLoading ? 'bg-gray-400' : 'bg-primary'
            }`}
            onPress={handleEmailLogin}
            disabled={isFormLoading}
          >
            {isFormLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Přihlásit se
              </Text>
            )}
          </TouchableOpacity>

          {/* Social Login Divider */}
          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-secondary-500 text-sm">nebo</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            className="border border-gray-300 rounded-lg p-4 items-center mb-3 bg-white flex-row justify-center"
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text className="text-secondary-700 text-base font-semibold ml-2">
              {loading ? 'Přihlašování...' : 'Pokračovat s Google'}
            </Text>
          </TouchableOpacity>

          {/* Apple Login Button */}
          <TouchableOpacity
            className="bg-black rounded-lg p-4 items-center mb-6 flex-row justify-center"
            onPress={handleAppleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-apple" size={20} color="#ffffff" />
            <Text className="text-white text-base font-semibold ml-2">
              {loading ? 'Přihlašování...' : 'Pokračovat s Apple'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-secondary-500 text-sm">Nemáte účet? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity disabled={isFormLoading}>
                <Text className="text-primary text-sm font-semibold">
                  Zaregistrujte se
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
