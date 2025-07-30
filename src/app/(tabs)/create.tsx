import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Platform,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView, ThemedText, ThemedCard } from '../../components/ui/themed-view';
import { useTheme } from '../../contexts/theme-context';
import { AudioPicker } from '../../components/audio/AudioPicker';
import { AudioTrack } from '../../services/audio/AudioManager';
import { SoundLibrary } from '../../services/audio/SoundLibrary';

export default function AddAlarmScreen() {
  const { isDark } = useTheme();
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);
  const [vibration, setVibration] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAudioPicker, setShowAudioPicker] = useState(false);

  // Initialize default audio on component mount
  useEffect(() => {
    const initializeDefaultAudio = async () => {
      try {
        const defaultSound = SoundLibrary.getAllSounds()[0];
        const defaultTrack = await SoundLibrary.convertToAudioTrack(defaultSound);
        setSelectedAudio(defaultTrack);
      } catch (error) {
        console.error('Failed to initialize default audio:', error);
      }
    };
    
    if (!selectedAudio) {
      initializeDefaultAudio();
    }
  }, [selectedAudio]);

  // Handle audio selection
  const handleAudioSelect = (audio: AudioTrack) => {
    console.log('🎵 Audio selected:', audio);
    setSelectedAudio(audio);
    setShowAudioPicker(false);
  };

  // Handle opening audio picker
  const handleOpenAudioPicker = () => {
    console.log('🎵 Opening audio picker, current state:', { selectedAudio, showAudioPicker });
    setShowAudioPicker(true);
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Format time as 24h European format
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('cs-CZ', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Handle time picker change
  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  // Save alarm to local storage
  const saveAlarm = async () => {
    if (days.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    setIsLoading(true);
    try {
      const alarmId = Date.now().toString();
      const newAlarm = {
        id: alarmId,
        time: formatTime(selectedTime),
        days: days,
        song: selectedAudio?.name || 'Wake Up Song',
        audioTrack: selectedAudio, // Store full audio track info
        vibration: vibration,
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      // Get existing alarms
      const existingAlarms = await AsyncStorage.getItem('alarms');
      const alarms = existingAlarms ? JSON.parse(existingAlarms) : [];
      
      // Add new alarm
      alarms.push(newAlarm);
      
      // Save back to storage
      await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
      
      Alert.alert(
        'Success', 
        `Alarm set for ${formatTime(selectedTime)}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving alarm:', error);
      Alert.alert('Error', 'Failed to save alarm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="close" size={24} color={isDark ? "#FFFFFF" : "#0F172A"} />
            </TouchableOpacity>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
              Add Alarm
            </ThemedText>
            <TouchableOpacity 
              style={{ backgroundColor: '#5CFFF0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}
              onPress={saveAlarm}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 16, color: '#000000', fontWeight: '600' }}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <ThemedCard style={{ padding: 24, marginBottom: 24, borderRadius: 12 }}>
            <ThemedText style={{ fontSize: 12, color: '#5CFFF0', fontWeight: '600', marginBottom: 16 }}>
              ⏰ ALARM TIME
            </ThemedText>
            
            <TouchableOpacity 
              style={{ backgroundColor: isDark ? '#0D1A1A' : '#F8FAFC', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center' }}
              onPress={() => setShowTimePicker(true)}
            >
              <ThemedText style={{ fontSize: 48, fontWeight: '800', textAlign: 'center' }}>
                {formatTime(selectedTime)}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                Tap to change time
              </ThemedText>
            </TouchableOpacity>

            {/* Native Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                locale="cs-CZ"
              />
            )}
          </ThemedCard>

          {/* Days Selection */}
          <View className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <Text className="text-caption text-neon-aqua font-semibold mb-4">
              📅 REPEAT DAYS
            </Text>
            
            <View className="flex-row flex-wrap justify-between">
              {weekDays.map((day) => (
                <TouchableOpacity
                  key={day}
                  className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                    days.includes(day) 
                      ? 'bg-gradient-mint border border-neon-mint' 
                      : 'bg-bg-clickable border border-border-DEFAULT'
                  }`}
                  onPress={() => {
                    if (days.includes(day)) {
                      setDays(days.filter(d => d !== day));
                    } else {
                      setDays([...days, day]);
                    }
                  }}
                >
                  <Text className={`text-small font-semibold ${
                    days.includes(day) ? 'text-black' : 'text-text-secondary'
                  }`}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Audio Selection */}
          <TouchableOpacity 
            style={{
              backgroundColor: isDark ? '#1A2626' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderWidth: 1,
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
            onPress={handleOpenAudioPicker}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <ThemedText style={{ fontSize: 12, color: '#9BFF93', fontWeight: '600' }}>
                🎵 ALARM SOUND
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#A8B4B6" />
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="musical-notes" size={20} color="#66F0FF" />
              <ThemedText style={{ fontSize: 16, marginLeft: 12, flex: 1 }}>
                {selectedAudio?.name || 'Loading...'}
              </ThemedText>
              {selectedAudio && (
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: selectedAudio.type === 'predefined' ? '#E8F5E8' : 
                                  selectedAudio.type === 'uploaded' ? '#E0F2E0' : '#F0F8FF',
                  borderRadius: 4,
                }}>
                  <Text style={{ 
                    fontSize: 10, 
                    color: selectedAudio.type === 'predefined' ? '#10B981' : 
                           selectedAudio.type === 'uploaded' ? '#059669' : '#3B82F6',
                    fontWeight: '600'
                  }}>
                    {selectedAudio.type === 'predefined' ? 'Built-in' : 
                     selectedAudio.type === 'uploaded' ? 'Custom' : 'Spotify'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Audio Picker Modal */}
          {showAudioPicker && (
            <ThemedCard style={{ padding: 0, marginBottom: 24, borderRadius: 12, height: 500 }}>
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
                    Choose Alarm Sound
                  </ThemedText>
                  <TouchableOpacity onPress={() => setShowAudioPicker(false)}>
                    <Ionicons name="close" size={24} color={isDark ? '#A8B4B6' : '#64748B'} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={{ flex: 1, padding: 16 }}>
                <AudioPicker
                  selectedAudio={selectedAudio || undefined}
                  onAudioSelect={handleAudioSelect}
                />
              </View>
            </ThemedCard>
          )}

          {/* Settings */}
          <View className="bg-bg-elevated border border-border-visible rounded-xl p-6 mb-6">
            <Text className="text-caption text-neon-primary font-semibold mb-4">
              ⚙️ SETTINGS  
            </Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="phone-portrait" size={20} color="#75FFB0" />
                <Text className="text-body text-text-primary ml-3">
                  Vibration
                </Text>
              </View>
              <Switch
                value={vibration}
                onValueChange={setVibration}
                trackColor={{ false: '#1A2626', true: '#75FFB0' }}
                thumbColor={vibration ? '#FFFFFF' : '#A8B4B6'}
              />
            </View>
          </View>

          {/* Bottom padding for safe area */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
