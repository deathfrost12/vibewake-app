import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Dimensions, Animated, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { ThemedView, ThemedText } from '../../components/ui/themed-view';
import { useAlarmStore } from '../../stores/alarm-store';
import { AudioManager } from '../../services/audio/AudioManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH * 0.8;
const THUMB_SIZE = 70;
const SLIDE_THRESHOLD = SLIDER_WIDTH * 0.7;

export default function AlarmRingingScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const { alarms, deleteAlarm } = useAlarmStore();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSliding, setIsSliding] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const backgroundPulse = useRef(new Animated.Value(0)).current;
  
  const alarm = alarms.find(a => a.id === alarmId);

  useEffect(() => {
    // Hide status bar for immersive experience
    StatusBar.setHidden(true);
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Start background pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundPulse, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Play alarm audio
    if (alarm?.audioTrack) {
      AudioManager.loadAudio(alarm.audioTrack)
        .then(() => AudioManager.playAsync())
        .catch(error => console.error('Failed to play alarm audio:', error));
    }

    return () => {
      clearInterval(timeInterval);
      StatusBar.setHidden(false);
      AudioManager.stopAsync().catch(console.error);
    };
  }, [alarm]);

  const handleSlideGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    const progress = Math.max(0, Math.min(translationX, SLIDER_WIDTH - THUMB_SIZE));
    
    slideAnimation.setValue(progress);
    
    // Haptic feedback when sliding
    if (progress > 20 && !isSliding) {
      setIsSliding(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSlideEnd = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    
    if (translationX >= SLIDE_THRESHOLD) {
      // Dismiss alarm
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      handleDismissAlarm();
    } else {
      // Animate back to start
      Animated.spring(slideAnimation, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
      setIsSliding(false);
    }
  };

  const handleDismissAlarm = async () => {
    try {
      await AudioManager.stopAsync();
      
      if (alarm && !alarm.repeatDays?.length) {
        // Delete one-time alarms
        await deleteAlarm(alarm.id);
      }
      
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Failed to dismiss alarm:', error);
    }
  };

  const handleSnooze = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Snooze Alarm',
      'How long would you like to snooze?',
      [
        { text: '5 minutes', onPress: () => snoozeAlarm(5) },
        { text: '10 minutes', onPress: () => snoozeAlarm(10) },
        { text: '15 minutes', onPress: () => snoozeAlarm(15) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const snoozeAlarm = async (minutes: number) => {
    await AudioManager.stopAsync();
    // Here you would implement snooze logic
    console.log(`Snoozed for ${minutes} minutes`);
    router.replace('/(tabs)/dashboard');
  };

  const handleEmergencyStop = () => {
    setTapCount(prev => prev + 1);
    
    if (tapCount >= 4) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      handleDismissAlarm();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Reset tap count after 2 seconds
      setTimeout(() => setTapCount(0), 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!alarm) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Alarm not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#000000' }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Animated Background */}
        <Animated.View 
          className="absolute inset-0"
          style={{
            opacity: backgroundPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3],
            }),
            backgroundColor: '#5CFFF0',
          }}
        />

        {/* Header - Emergency Stop */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity onPress={handleEmergencyStop}>
            <ThemedText className="text-text-secondary" style={{ fontSize: 12 }}>
              {tapCount > 0 ? `Tap ${5 - tapCount} more times to stop` : 'Emergency stop'}
            </ThemedText>
          </TouchableOpacity>
          
          <View className="bg-interactive-DEFAULT rounded-full px-3 py-1">
            <ThemedText className="text-text-secondary" style={{ fontSize: 10 }}>
              ALARM
            </ThemedText>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Alarm Icon */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnimation }],
              marginBottom: 40,
            }}
          >
            <View className="bg-neon-primary rounded-full p-8">
              <Ionicons name="alarm" size={80} color="#000000" />
            </View>
          </Animated.View>

          {/* Time Display */}
          <View className="items-center mb-8">
            <ThemedText style={{ 
              fontSize: 72, 
              fontWeight: '800',
              color: '#5CFFF0',
              textAlign: 'center',
            }}>
              {formatTime(currentTime)}
            </ThemedText>
            
            <ThemedText className="text-text-secondary" style={{ 
              fontSize: 18,
              marginTop: 8,
              textAlign: 'center',
            }}>
              {formatDate(currentTime)}
            </ThemedText>
          </View>

          {/* Alarm Info */}
          <View className="bg-bg-elevated border border-border-visible rounded-xl p-4 mb-12 w-full">
            <View className="flex-row items-center justify-center">
              <Ionicons name="musical-notes" size={20} color="#66F0FF" />
              <ThemedText className="text-text-primary ml-2" style={{ fontSize: 16, fontWeight: '600' }}>
                {alarm.audioTrack.name}
              </ThemedText>
            </View>
            
            <ThemedText className="text-text-secondary text-center mt-2" style={{ fontSize: 12 }}>
              {alarm.title}
            </ThemedText>
          </View>

          {/* Snooze Button */}
          <TouchableOpacity
            onPress={handleSnooze}
            className="bg-interactive-DEFAULT border border-border-visible rounded-full px-8 py-4 mb-8"
          >
            <View className="flex-row items-center">
              <Ionicons name="time" size={24} color="#75FFB0" />
              <ThemedText className="text-text-primary ml-2" style={{ fontSize: 16, fontWeight: '600' }}>
                Snooze
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Slide to Dismiss */}
        <View className="px-6 pb-12">
          <View className="items-center mb-4">
            <ThemedText className="text-text-secondary" style={{ fontSize: 14 }}>
              Slide to dismiss alarm
            </ThemedText>
          </View>

          <View 
            className="bg-interactive-DEFAULT rounded-full relative"
            style={{ 
              height: THUMB_SIZE,
              width: SLIDER_WIDTH,
              marginHorizontal: (SCREEN_WIDTH - SLIDER_WIDTH) / 2,
            }}
          >
            {/* Slider Track */}
            <View className="absolute inset-0 rounded-full border border-border-visible" />
            
            {/* Progress Fill */}
            <Animated.View
              className="absolute left-0 top-0 bottom-0 bg-neon-primary rounded-full"
              style={{
                width: slideAnimation.interpolate({
                  inputRange: [0, SLIDER_WIDTH - THUMB_SIZE],
                  outputRange: [THUMB_SIZE, SLIDER_WIDTH],
                  extrapolate: 'clamp',
                }),
              }}
            />

            {/* Slider Thumb */}
            <PanGestureHandler
              onGestureEvent={handleSlideGesture}
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === 5) { // End state
                  handleSlideEnd({ nativeEvent } as PanGestureHandlerGestureEvent);
                }
              }}
            >
              <Animated.View
                className="absolute bg-white rounded-full items-center justify-center shadow-lg"
                style={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  left: slideAnimation,
                }}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={isSliding ? "#5CFFF0" : "#666666"} 
                />
              </Animated.View>
            </PanGestureHandler>

            {/* Slide Text */}
            <View className="absolute inset-0 items-center justify-center">
              <ThemedText 
                className="text-text-secondary"
                style={{ 
                  fontSize: 16,
                  fontWeight: '600',
                  opacity: isSliding ? 0 : 0.7,
                }}
              >
                Slide to dismiss
              </ThemedText>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}