import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, ThemedCard } from '../ui/themed-view';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';
import { alarmKitAuthService } from '../../services/alarmkit/alarmkit-auth-service';

interface AlarmKitOnboardingProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onDismiss?: () => void;
  style?: any;
}

export function AlarmKitOnboarding({
  onPermissionGranted,
  onPermissionDenied,
  onDismiss,
  style,
}: AlarmKitOnboardingProps) {
  const { isDark } = useTheme();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    checkAlarmKitStatus();
  }, []);

  const checkAlarmKitStatus = async () => {
    try {
      const available = await alarmKitAuthService.isAvailable();
      const shouldShowOnboarding =
        await alarmKitAuthService.shouldShowOnboarding();

      setIsAvailable(available);
      setShouldShow(available && shouldShowOnboarding);
    } catch (error) {
      console.warn('Failed to check AlarmKit status:', error);
      setShouldShow(false);
    }
  };

  const handleEnableNativeAlarms = async () => {
    setIsLoading(true);

    try {
      const granted = await alarmKitAuthService.requestAuthorization();

      if (granted) {
        Alert.alert(
          '🎉 Native Alarms Enabled!',
          'Your alarms will now use iOS native system with enhanced reliability. They will work even in silent mode and focus states.',
          [{ text: 'Great!', style: 'default' }]
        );
        onPermissionGranted?.();
      } else {
        Alert.alert(
          'Permission Required',
          'To use native iOS alarms, please enable alarm permissions in Settings > Privacy & Security > Alarms.',
          [
            { text: 'Maybe Later', style: 'cancel' },
            {
              text: 'Open Settings',
              style: 'default',
              onPress: () => {
                // Note: Opening settings programmatically is limited on iOS
                console.log('User should open Settings manually');
              },
            },
          ]
        );
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Failed to request AlarmKit authorization:', error);
      Alert.alert(
        'Error',
        'Failed to enable native alarms. Please try again later.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShouldShow(false);
    onDismiss?.();
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <ThemedCard
      style={[
        {
          margin: 16,
          padding: 20,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: APP_COLORS.primary,
          backgroundColor: `${APP_COLORS.primary}10`,
        },
        style,
      ]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: APP_COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="alarm" size={20} color="#000000" />
          </View>
          <ThemedText
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: APP_COLORS.primary,
              flex: 1,
            }}
          >
            🚀 Enhanced iOS Alarms Available!
          </ThemedText>
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={{
            padding: 4,
          }}
        >
          <Ionicons name="close" size={20} color={theme.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Benefits */}
      <View style={{ marginBottom: 16 }}>
        <ThemedText
          style={{
            fontSize: 14,
            marginBottom: 12,
            opacity: 0.9,
          }}
        >
          Upgrade to native iOS alarms for maximum reliability:
        </ThemedText>

        {[
          {
            icon: 'checkmark-circle',
            text: 'Works in silent mode & focus states',
          },
          { icon: 'shield-checkmark', text: 'System-level alarm priority' },
          { icon: 'refresh', text: 'Survives app updates & restarts' },
          { icon: 'watch', text: 'Apple Watch integration' },
        ].map((benefit, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Ionicons
              name={benefit.icon as any}
              size={16}
              color={APP_COLORS.primary}
              style={{ marginRight: 8 }}
            />
            <ThemedText
              style={{
                fontSize: 13,
                opacity: 0.8,
                flex: 1,
              }}
            >
              {benefit.text}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={handleEnableNativeAlarms}
          disabled={isLoading}
          style={{
            flex: 1,
            backgroundColor: APP_COLORS.primary,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#000000',
            }}
          >
            {isLoading ? 'Enabling...' : 'Enable Native Alarms'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDismiss}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <ThemedText
            style={{
              fontSize: 14,
              color: theme.text.secondary,
            }}
          >
            Maybe Later
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* iOS Version Note */}
      <View
        style={{
          marginTop: 12,
          padding: 8,
          borderRadius: 8,
          backgroundColor: `${theme.text.secondary}10`,
        }}
      >
        <ThemedText
          style={{
            fontSize: 11,
            opacity: 0.7,
            textAlign: 'center',
          }}
        >
          Native alarms require iOS 26.0+. Fallback to notifications on older
          versions.
        </ThemedText>
      </View>
    </ThemedCard>
  );
}

export default AlarmKitOnboarding;
