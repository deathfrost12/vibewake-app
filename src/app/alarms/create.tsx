import React, { useState } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedView, ThemedText, ThemedCard } from '../../components/ui/themed-view';
import { AudioPicker } from '../../components/audio/AudioPicker';
import { useAlarmStore } from '../../stores/alarm-store';
import { AudioTrack } from '../../services/audio/types';

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
  const { createAlarm, isLoading } = useAlarmStore();

  const [alarmTime, setAlarmTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);
  const [showAudioPicker, setShowAudioPicker] = useState(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setAlarmTime(selectedTime);
    }
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId)
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  const handleCreateAlarm = async () => {
    if (!selectedAudio) {
      Alert.alert('Missing Audio', 'Please select an audio track for your alarm.');
      return;
    }

    try {
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
    } catch (error: any) {
      console.error('Failed to create alarm:', error);
      Alert.alert('Error', error.message || 'Failed to create alarm');
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSelectedDaysText = () => {
    if (selectedDays.length === 0) return 'Once';
    if (selectedDays.length === 7) return 'Every day';
    if (selectedDays.length === 5 && selectedDays.every(day => day >= 1 && day <= 5)) {
      return 'Weekdays';
    }
    if (selectedDays.length === 2 && selectedDays.includes(0) && selectedDays.includes(6)) {
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
          className="space-y-6"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mt-4 mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#66F0FF" />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
                Create Alarm
              </ThemedText>
              <ThemedText className="text-text-secondary" style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                Set your wake-up call
              </ThemedText>
            </View>
          </View>

          {/* Time Selection - Hero Card */}
          <ThemedCard className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <ThemedText className="text-caption text-neon-mint font-semibold mb-4">
              ⏰ ALARM TIME
            </ThemedText>
            
            <View className="items-center py-4">
              <DateTimePicker
                value={alarmTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                textColor="#FFFFFF"
                style={{ width: '100%', height: 120 }}
              />
              
              <View className="bg-interactive-accent rounded-xl px-6 py-3 mt-4">
                <ThemedText style={{ 
                  fontSize: 28, 
                  fontWeight: 'bold', 
                  color: '#000000',
                  textAlign: 'center',
                }}>
                  {formatTime(alarmTime)}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Repeat Days */}
          <ThemedCard className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <ThemedText className="text-caption text-neon-mint font-semibold mb-4">
              🔄 REPEAT
            </ThemedText>
            
            <View className="flex-row justify-between mb-4">
              {DAYS_OF_WEEK.map(day => (
                <TouchableOpacity
                  key={day.id}
                  onPress={() => toggleDay(day.id)}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    selectedDays.includes(day.id)
                      ? 'bg-neon-primary'
                      : 'bg-interactive-DEFAULT border border-border-visible'
                  }`}
                >
                  <ThemedText 
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: selectedDays.includes(day.id) ? '#000000' : '#A8B4B6',
                    }}
                  >
                    {day.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="bg-interactive-DEFAULT rounded-lg p-3">
              <ThemedText className="text-text-secondary text-center" style={{ fontSize: 14 }}>
                {getSelectedDaysText()}
              </ThemedText>
            </View>
          </ThemedCard>

          {/* Audio Selection */}
          <ThemedCard className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <ThemedText className="text-caption text-neon-mint font-semibold mb-4">
              🎵 ALARM SOUND
            </ThemedText>
            
            <TouchableOpacity
              onPress={() => setShowAudioPicker(true)}
              className="bg-interactive-DEFAULT border border-border-visible rounded-xl p-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                    {selectedAudio ? selectedAudio.name : 'Select audio track'}
                  </ThemedText>
                  <ThemedText className="text-text-secondary" style={{ fontSize: 12, marginTop: 2 }}>
                    {selectedAudio 
                      ? `${selectedAudio.type.charAt(0).toUpperCase() + selectedAudio.type.slice(1)} • ${selectedAudio.duration ? Math.round(selectedAudio.duration / 1000) + 's' : 'Unknown duration'}`
                      : 'Tap to choose your wake-up sound'
                    }
                  </ThemedText>
                </View>
                
                <View className="flex-row items-center ml-3">
                  {selectedAudio && (
                    <View className={`px-2 py-1 rounded mr-2 ${
                      selectedAudio.type === 'spotify' ? 'bg-neon-aqua' : 
                      selectedAudio.type === 'uploaded' ? 'bg-neon-mint' : 'bg-neon-lime'
                    }`}>
                      <ThemedText style={{ 
                        fontSize: 10, 
                        fontWeight: '600',
                        color: '#000000',
                      }}>
                        {selectedAudio.type === 'uploaded' ? 'Custom' : 
                         selectedAudio.type === 'spotify' ? 'Spotify' : 'Built-in'}
                      </ThemedText>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color="#66F0FF" />
                </View>
              </View>
            </TouchableOpacity>
          </ThemedCard>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleCreateAlarm}
            disabled={isLoading}
            className={`bg-gradient-cta rounded-xl py-4 items-center mb-8 ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            <ThemedText style={{ 
              fontSize: 16, 
              fontWeight: 'bold',
              color: '#000000',
            }}>
              {isLoading ? 'Creating Alarm...' : 'Create Alarm'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Audio Picker Modal */}
        {showAudioPicker && (
          <AudioPicker
            selectedAudio={selectedAudio || undefined}
            onAudioSelect={(audio: AudioTrack) => {
              setSelectedAudio(audio);
              setShowAudioPicker(false);
            }}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}