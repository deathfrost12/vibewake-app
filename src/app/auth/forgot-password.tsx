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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
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
    if (email) {
      clearError();
    }
  }, [email, clearError]);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Chyba', 'Prosím zadejte emailovou adresu');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Email odeslán',
        'Pokyny pro obnovení hesla byly odeslány na vaši emailovou adresu',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert('Chyba', result.error || 'Nepodařilo se odeslat email');
    }
  };

  const isFormLoading = loading || isLoading || passwordResetLoading;

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
          {/* Back Button */}
          <View className="items-start mb-5">
            <TouchableOpacity
              className="flex-row items-center p-2"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
              <Text className="text-base text-secondary-700 ml-2">Zpět</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="mail-outline" size={40} color="#14C46D" />
            </View>

            <Text className="text-3xl font-bold text-secondary-800 mb-2 text-center">
              Zapomněli jste heslo?
            </Text>
            <Text className="text-base text-secondary-500 text-center leading-6">
              Zadejte svou emailovou adresu a pošleme vám pokyny pro obnovení
              hesla
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {/* Success Message */}
          {passwordResetSent && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
              <Text className="text-green-600 text-sm">
                Email s pokyny pro obnovení hesla byl odeslán!
              </Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-secondary-700 mb-1.5">
              Emailová adresa
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
              autoFocus
            />
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity
            className={`rounded-lg p-4 items-center mb-6 ${
              isFormLoading ? 'bg-gray-400' : 'bg-primary'
            }`}
            onPress={handleResetPassword}
            disabled={isFormLoading}
          >
            {isFormLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Odeslat pokyny
              </Text>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <View className="items-center mb-8">
            <Text className="text-sm text-secondary-500 text-center leading-5">
              Nevidíte email? Zkontrolujte složku spam nebo zkuste zadat jinou
              emailovou adresu.
            </Text>
          </View>

          {/* Back to Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-secondary-500 text-sm">
              Vzpomněli jste si na heslo?{' '}
            </Text>
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
