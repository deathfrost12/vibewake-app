import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';
import { ThemedView, ThemedText, ThemedCard } from '../../components/ui/themed-view';
import { useAlarmStore } from '../../stores/alarm-store';

export default function AlarmsScreen() {
  const { alarms, isLoading, loadAlarms, toggleAlarm } = useAlarmStore();
  const { isDark } = useTheme();


  // Reload alarms when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );


  // Format days for display
  const formatDays = (days?: number[]) => {
    if (!days || days.length === 0) return 'Once';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.every(day => day >= 1 && day <= 5)) return 'Mon-Fri';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekend';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.sort().map(day => dayNames[day]).join(', ');
  };

  // Get next alarm
  const getNextAlarm = () => {
    const enabledAlarms = alarms.filter(alarm => alarm.isActive);
    if (enabledAlarms.length === 0) return null;
    
    // For now, just return the first enabled alarm
    // In real app, you'd calculate the actual next occurrence
    return enabledAlarms[0];
  };

  // Format time for display
  const formatTime = (time: Date | string) => {
    const dateObj = typeof time === 'string' ? new Date(time) : time;
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '00:00';
    }
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const nextAlarm = getNextAlarm();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          {/* Header with greeting */}
          <View style={{ marginTop: 24, marginBottom: 32 }}>
            <ThemedText style={{ fontSize: 32, fontWeight: 'bold', lineHeight: 40 }}>
              Good Evening, <Text style={{ color: APP_COLORS.primary }}>Daniel</Text>
            </ThemedText>
            <ThemedText style={{ fontSize: 14, lineHeight: 20, marginTop: 8, opacity: 0.7 }}>
              Ready to wake up? ✨
            </ThemedText>
          </View>

          {/* Next Alarm Hero Card */}
          {nextAlarm ? (
            <ThemedCard style={{ padding: 24, marginBottom: 32, borderRadius: 12 }}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push('/alarms/create')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <ThemedText style={{ fontSize: 12, color: APP_COLORS.primary, fontWeight: '600' }}>
                    🌅 NEXT ALARM
                  </ThemedText>
                  <View style={{ width: 12, height: 12, backgroundColor: APP_COLORS.primary, borderRadius: 6 }} />
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
                  <ThemedText style={{ fontSize: 48, fontWeight: '800' }}>
                    {formatTime(nextAlarm.time)}
                  </ThemedText>
                </View>
                
                <ThemedText style={{ fontSize: 16, opacity: 0.7, marginBottom: 8 }}>
                  {formatDays(nextAlarm.repeatDays)}
                </ThemedText>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="musical-notes" size={16} color={APP_COLORS.accent} />
                  <ThemedText style={{ fontSize: 12, color: APP_COLORS.accent, marginLeft: 8 }}>
                    {nextAlarm.audioTrack.name}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </ThemedCard>
          ) : (
            <ThemedCard style={{ padding: 24, marginBottom: 32, borderRadius: 12 }}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push('/alarms/create')}
              >
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                  <Ionicons name="add-circle-outline" size={48} color={theme.text.secondary} />
                  <ThemedText style={{ fontSize: 20, fontWeight: '600', marginTop: 12 }}>
                    No Alarm Set
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    Tap to create your first alarm
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </ThemedCard>
          )}

          {/* My Alarms Section */}
          <View style={{ marginBottom: 32 }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
              My Alarms
            </ThemedText>
            
            {isLoading ? (
              <ThemedCard style={{ padding: 24, alignItems: 'center', borderRadius: 12 }}>
                <ThemedText style={{ fontSize: 16 }}>Loading alarms...</ThemedText>
              </ThemedCard>
            ) : alarms.length === 0 ? (
              <ThemedCard style={{ padding: 24, alignItems: 'center', borderRadius: 12 }}>
                <Ionicons name="alarm-outline" size={32} color={theme.text.secondary} />
                <ThemedText style={{ fontSize: 16, marginTop: 12, textAlign: 'center' }}>
                  No alarms yet
                </ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 4, textAlign: 'center' }}>
                  Create your first alarm to get started
                </ThemedText>
              </ThemedCard>
            ) : (
              <View>
                {alarms.map((alarm) => (
                  <TouchableOpacity
                    key={alarm.id}
                    style={{
                      backgroundColor: theme.elevated,
                      borderWidth: 1,
                      borderColor: alarm.isActive ? APP_COLORS.primary : theme.border,
                      borderRadius: 12,
                      padding: 20,
                      marginBottom: 12,
                    }}
                    activeOpacity={0.8}
                    onPress={() => router.push('/alarms/create')}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
                          <ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
                            {formatTime(alarm.time)}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 14, opacity: 0.7, marginLeft: 12 }}>
                            {formatDays(alarm.repeatDays)}
                          </ThemedText>
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons 
                            name="musical-notes" 
                            size={14} 
                            color={alarm.isActive ? APP_COLORS.accent : theme.text.muted} 
                          />
                          <ThemedText style={{ 
                            fontSize: 12, 
                            color: alarm.isActive ? APP_COLORS.accent : theme.text.muted,
                            marginLeft: 8,
                          }}>
                            {alarm.audioTrack.name}
                          </ThemedText>
                        </View>
                      </View>
                      
                      {/* Toggle Switch */}
                      <TouchableOpacity
                        style={{
                          width: 48,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: alarm.isActive ? APP_COLORS.primary : theme.border,
                          padding: 2,
                          justifyContent: 'center',
                        }}
                        activeOpacity={0.8}
                        onPress={() => toggleAlarm(alarm.id)}
                      >
                        <View 
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: '#FFFFFF',
                            marginLeft: alarm.isActive ? 24 : 0,
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 32 }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
              Quick Actions
            </ThemedText>
            
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.elevated,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                activeOpacity={0.8}
                onPress={() => router.push('/alarms/create')}
              >
                <Ionicons name="add-circle" size={24} color={APP_COLORS.primary} />
                <ThemedText style={{ fontSize: 12, color: theme.text.secondary, marginTop: 8, textAlign: 'center' }}>
                  New Alarm
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.elevated,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="musical-notes" size={24} color={APP_COLORS.success} />
                <ThemedText style={{ fontSize: 12, color: theme.text.secondary, marginTop: 8, textAlign: 'center' }}>
                  Sound Library
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.elevated,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Ionicons name="settings" size={24} color={APP_COLORS.accent} />
                <ThemedText style={{ fontSize: 12, color: theme.text.secondary, marginTop: 8, textAlign: 'center' }}>
                  Settings
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Developer Menu Button */}
            <TouchableOpacity
              style={{
                backgroundColor: theme.elevated,
                borderWidth: 2,
                borderColor: '#FF6B6B',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderStyle: 'dashed',
              }}
              activeOpacity={0.8}
              onPress={() => router.push('/dev-menu')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="code-slash" size={24} color="#FF6B6B" />
                <ThemedText style={{ fontSize: 16, color: '#FF6B6B', marginLeft: 12, fontWeight: '600' }}>
                  🛠️ Developer Menu
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 12, color: theme.text.muted, marginTop: 4, textAlign: 'center' }}>
                Navigate to any screen • Testing tools
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Bottom padding for FAB */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}