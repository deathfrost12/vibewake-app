import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SimpleThemeToggle } from '../../components/ui/theme-switcher';
import { ThemedView, ThemedText, ThemedCard } from '../../components/ui/themed-view';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [snooze, setSnooze] = useState(true);
  const [weekendMode, setWeekendMode] = useState(false);

  const handleAbout = () => {
    Alert.alert(
      'About VibeWake',
      'VibeWake v1.0.0\n\nA beautiful alarm clock app with custom music support.\n\nMade with ❤️ by Daniel Holes',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Need help? Contact us at:\nsupport@vibewake.app',
      [{ text: 'OK' }]
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 24 }}>
            <View>
              <ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
                Settings
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                Customize your alarm experience
              </ThemedText>
            </View>
            <SimpleThemeToggle />
          </View>

          {/* Alarm Settings */}
          <View className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <Text className="text-caption text-neon-mint font-semibold mb-4">
              ⏰ ALARM SETTINGS
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <Ionicons name="notifications" size={20} color="#66F0FF" />
                  <View className="ml-3">
                    <Text className="text-body text-text-primary font-medium">
                      Push Notifications
                    </Text>
                    <Text className="text-small text-text-secondary">
                      Get notified when alarms are set
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#1A2626', true: '#75FFB0' }}
                  thumbColor={notifications ? '#FFFFFF' : '#A8B4B6'}
                />
              </View>
              
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <Ionicons name="phone-portrait" size={20} color="#75FFB0" />
                  <View className="ml-3">
                    <Text className="text-body text-text-primary font-medium">
                      Vibration
                    </Text>
                    <Text className="text-small text-text-secondary">
                      Vibrate when alarm goes off
                    </Text>
                  </View>
                </View>
                <Switch
                  value={vibration}
                  onValueChange={setVibration}
                  trackColor={{ false: '#1A2626', true: '#75FFB0' }}
                  thumbColor={vibration ? '#FFFFFF' : '#A8B4B6'}
                />
              </View>
              
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="#9BFF93" />
                  <View className="ml-3">
                    <Text className="text-body text-text-primary font-medium">
                      Snooze
                    </Text>
                    <Text className="text-small text-text-secondary">
                      Allow 5-minute snooze
                    </Text>
                  </View>
                </View>
                <Switch
                  value={snooze}
                  onValueChange={setSnooze}
                  trackColor={{ false: '#1A2626', true: '#75FFB0' }}
                  thumbColor={snooze ? '#FFFFFF' : '#A8B4B6'}
                />
              </View>
            </View>
          </View>

          {/* Smart Features */}
          <View className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <Text className="text-caption text-neon-aqua font-semibold mb-4">
              🧠 SMART FEATURES
            </Text>
            
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <Ionicons name="bed" size={20} color="#66F0FF" />
                <View className="ml-3">
                  <Text className="text-body text-text-primary font-medium">
                    Weekend Mode
                  </Text>
                  <Text className="text-small text-text-secondary">
                    Softer alarms on weekends
                  </Text>
                </View>
              </View>
              <Switch
                value={weekendMode}
                onValueChange={setWeekendMode}
                trackColor={{ false: '#1A2626', true: '#75FFB0' }}
                thumbColor={weekendMode ? '#FFFFFF' : '#A8B4B6'}
              />
            </View>
          </View>

          {/* Sound Library */}
          <TouchableOpacity className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-caption text-neon-lime font-semibold">
                🎵 SOUND LIBRARY
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#A8B4B6" />
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="library" size={20} color="#9BFF93" />
              <Text className="text-body text-text-primary ml-3">
                Manage alarm sounds and music
              </Text>
            </View>
          </TouchableOpacity>

          {/* App Info */}
          <View className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <Text className="text-caption text-neon-primary font-semibold mb-4">
              ℹ️ APP INFO
            </Text>
            
            <TouchableOpacity 
              className="flex-row items-center justify-between py-3"
              onPress={handleAbout}
            >
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#5CFFF0" />
                <Text className="text-body text-text-primary ml-3">
                  About VibeWake
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A8B4B6" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center justify-between py-3"
              onPress={handleSupport}
            >
              <View className="flex-row items-center">
                <Ionicons name="help-circle" size={20} color="#75FFB0" />
                <Text className="text-body text-text-primary ml-3">
                  Support & Help
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A8B4B6" />
            </TouchableOpacity>
          </View>

          {/* Version Info */}
          <View className="items-center py-6 mb-6">
            <Text className="text-small text-text-muted">
              VibeWake v1.0.0
            </Text>
            <Text className="text-small text-text-muted mt-1">
              Built with React Native & Expo
            </Text>
          </View>

          {/* Bottom padding for tab bar */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}