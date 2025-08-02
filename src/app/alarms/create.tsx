import React, { useState } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  ThemedView,
  ThemedText,
  ThemedCard,
} from '../../components/ui/themed-view';
import { AudioPicker } from '../../components/audio/AudioPicker';
import { useAlarmStore } from '../../stores/alarm-store';
import { AudioTrack } from '../../services/audio/types';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sun', fullName: 'Sunday' },
  { id: 1, name: 'Mon', fullName: 'Monday' },
  { id: 2, name: 'Tue', fullName: 'Tuesday' },
  { id: 3, name: 'Wed', fullName: 'Wednesday' },
  { id: 4, name: 'Thu', fullName: 'Thursday' },
  { id: 5, name: 'Fri', fullName: 'Friday' },
  { id: 6, name: 'Sat', fullName: 'Saturday' },
];

export default function CreateAlarmScreen() {
  const { createAlarm, updateAlarm, alarms, isLoading } = useAlarmStore();
  const { isDark } = useTheme();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  // Get editId from params to determine if we're editing
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;
  const editingAlarm = isEditing ? alarms.find(a => a.id === editId) : null;

  const [alarmTime, setAlarmTime] = useState(editingAlarm?.time || new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>(
    editingAlarm?.repeatDays || []
  );
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(
    editingAlarm?.audioTrack || null
  );
  const [showAudioPicker, setShowAudioPicker] = useState(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setAlarmTime(selectedTime);
    }
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
    );
  };

  const handleSaveAlarm = async () => {
    if (!selectedAudio) {
      Alert.alert(
        'Missing Audio',
        'Please select an audio track for your alarm.'
      );
      return;
    }

    try {
      if (isEditing && editId) {
        // Update existing alarm
        await updateAlarm(editId, {
          time: alarmTime,
          audioTrack: selectedAudio,
          repeatDays: selectedDays.length > 0 ? selectedDays : undefined,
        });

        Alert.alert(
          'Alarm Updated!',
          'Your alarm has been updated successfully.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        // Create new alarm
        await createAlarm({
          title: 'Alarm',
          time: alarmTime,
          isActive: true,
          audioTrack: selectedAudio,
          repeatDays: selectedDays.length > 0 ? selectedDays : undefined,
        });

        Alert.alert(
          'Alarm Created!',
          'Your alarm has been scheduled successfully.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error(
        `Failed to ${isEditing ? 'update' : 'create'} alarm:`,
        error
      );
      Alert.alert(
        'Error',
        error.message || `Failed to ${isEditing ? 'update' : 'create'} alarm`
      );
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSelectedDaysText = () => {
    if (selectedDays.length === 0) return 'Once';
    if (selectedDays.length === 7) return 'Every day';
    if (
      selectedDays.length === 5 &&
      selectedDays.every(day => day >= 1 && day <= 5)
    ) {
      return 'Weekdays';
    }
    if (
      selectedDays.length === 2 &&
      selectedDays.includes(0) &&
      selectedDays.includes(6)
    ) {
      return 'Weekends';
    }

    return selectedDays
      .sort()
      .map(day => DAYS_OF_WEEK[day].name)
      .join(', ');
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 24,
              marginBottom: 32,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={APP_COLORS.accent}
              />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <ThemedText
                style={{ fontSize: 32, fontWeight: 'bold', lineHeight: 40 }}
              >
                {isEditing ? 'Edit Alarm' : 'Create Alarm'}
              </ThemedText>
            </View>
          </View>

          {/* Time Selection - Hero Card */}
          <ThemedCard
            style={{ padding: 24, marginBottom: 32, borderRadius: 12 }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 12,
                  color: APP_COLORS.primary,
                  fontWeight: '600',
                }}
              >
                ⏰ ALARM TIME
              </ThemedText>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: APP_COLORS.primary,
                  borderRadius: 6,
                }}
              />
            </View>

            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <DateTimePicker
                value={alarmTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                textColor="#FFFFFF"
                style={{ width: '100%', height: 120 }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  marginTop: 16,
                }}
              >
                <ThemedText style={{ fontSize: 48, fontWeight: '800' }}>
                  {formatTime(alarmTime)}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Repeat Days */}
          <ThemedCard
            style={{ padding: 24, marginBottom: 32, borderRadius: 12 }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 12,
                  color: APP_COLORS.primary,
                  fontWeight: '600',
                }}
              >
                🔄 REPEAT DAYS
              </ThemedText>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              {DAYS_OF_WEEK.map(day => (
                <TouchableOpacity
                  key={day.id}
                  onPress={() => toggleDay(day.id)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: selectedDays.includes(day.id)
                      ? APP_COLORS.primary
                      : theme.elevated,
                    borderWidth: selectedDays.includes(day.id) ? 0 : 1,
                    borderColor: theme.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: selectedDays.includes(day.id)
                        ? '#000000'
                        : theme.text.secondary,
                    }}
                  >
                    {day.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View
              style={{
                backgroundColor: theme.elevated,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <ThemedText
                style={{ fontSize: 14, textAlign: 'center', opacity: 0.7 }}
              >
                {getSelectedDaysText()}
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Audio Selection */}
          <ThemedCard
            style={{ padding: 24, marginBottom: 32, borderRadius: 12 }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 12,
                  color: APP_COLORS.primary,
                  fontWeight: '600',
                }}
              >
                🎵 ALARM SOUND
              </ThemedText>
            </View>

            <TouchableOpacity
              onPress={() => setShowAudioPicker(true)}
              style={{
                backgroundColor: theme.elevated,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                    {selectedAudio ? selectedAudio.name : 'Select audio track'}
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}
                  >
                    {selectedAudio
                      ? `${selectedAudio.type.charAt(0).toUpperCase() + selectedAudio.type.slice(1)} • ${selectedAudio.duration ? Math.round(selectedAudio.duration / 1000) + 's' : 'Unknown duration'}`
                      : 'Tap to choose your wake-up sound'}
                  </ThemedText>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 12,
                  }}
                >
                  {selectedAudio && (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        marginRight: 8,
                        backgroundColor:
                          selectedAudio.type === 'spotify'
                            ? APP_COLORS.accent
                            : selectedAudio.type === 'uploaded'
                              ? APP_COLORS.success
                              : APP_COLORS.primary,
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 10,
                          fontWeight: '600',
                          color: '#000000',
                        }}
                      >
                        {selectedAudio.type === 'uploaded'
                          ? 'Custom'
                          : selectedAudio.type === 'spotify'
                            ? 'Spotify'
                            : 'Built-in'}
                      </ThemedText>
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={APP_COLORS.accent}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {selectedAudio && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 12,
                }}
              >
                <Ionicons
                  name="musical-notes"
                  size={16}
                  color={APP_COLORS.accent}
                />
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: APP_COLORS.accent,
                    marginLeft: 8,
                  }}
                >
                  {selectedAudio.name}
                </ThemedText>
              </View>
            )}
          </ThemedCard>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveAlarm}
            disabled={isLoading}
            style={{
              backgroundColor: APP_COLORS.primary,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 32,
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#000000',
              }}
            >
              {isLoading
                ? isEditing
                  ? 'Updating Alarm...'
                  : 'Creating Alarm...'
                : isEditing
                  ? 'Update Alarm'
                  : 'Create Alarm'}
            </ThemedText>
          </TouchableOpacity>

          {/* Bottom padding for safe area */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Audio Picker Modal */}
        {showAudioPicker && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
          >
            <SafeAreaView style={{ flex: 1, paddingTop: 60 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingHorizontal: 24,
                  paddingTop: 24,
                }}
              >
                {/* Modal Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                  }}
                >
                  <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
                    Choose Sound
                  </ThemedText>
                  <TouchableOpacity onPress={() => setShowAudioPicker(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={APP_COLORS.accent}
                    />
                  </TouchableOpacity>
                </View>

                <AudioPicker
                  selectedAudio={selectedAudio || undefined}
                  onAudioSelect={(audio: AudioTrack) => {
                    setSelectedAudio(audio);
                    setShowAudioPicker(false);
                  }}
                />
              </View>
            </SafeAreaView>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
