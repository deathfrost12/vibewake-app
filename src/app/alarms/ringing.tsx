import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeNavigation } from '../../hooks/use-safe-navigation';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { ThemedView, ThemedText } from '../../components/ui/themed-view';
import { useAlarmStore } from '../../stores/alarm-store';
import { alarmService } from '../../services/alarms/alarm-service';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';
import { SpotifyWebPlayer } from '../../components/spotify/SpotifyWebPlayer';
import { SpotifyTrack } from '../../services/auth/spotify-auth';
import { useAuthStore } from '../../stores/auth-store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH * 0.8;
const THUMB_SIZE = 70;
const SLIDE_THRESHOLD = SLIDER_WIDTH * 0.7;

export default function AlarmRingingScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const { alarms, deleteAlarm } = useAlarmStore();
  const { isDark } = useTheme();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  const { spotifyToken } = useAuthStore();
  const { replace } = useSafeNavigation();

  // Prevent multiple instances - early return if no alarmId
  if (!alarmId) {
    console.error('❌ AlarmRingingScreen mounted without alarmId');
    return null;
  }

  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSliding, setIsSliding] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const backgroundPulse = useRef(new Animated.Value(0)).current;

  const alarm = alarms.find(a => a.id === alarmId);

  // Prevent back navigation and duplicate screen mounting
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Prevent back navigation - user must use slide to dismiss or snooze
        console.log('🚫 Back navigation blocked - use slide to dismiss');
        return true; // This prevents the default back action
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      // Log when screen becomes focused to track duplicates
      console.log(`📱 Alarm ringing screen focused for alarm: ${alarmId}`);

      return () => {
        subscription.remove();
        console.log(`📱 Alarm ringing screen unfocused for alarm: ${alarmId}`);
      };
    }, [alarmId])
  );

  useEffect(() => {
    // Hide status bar for immersive experience
    StatusBar.setHidden(true);

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simplified background - no pulse animation

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

    // Check if alarm is already ringing (audio should already be playing via AlarmService)
    const checkAlarmState = () => {
      if (alarm?.audioTrack) {
        // Check if this is a Spotify track that needs the web player
        if (alarm.audioTrack.type === 'spotify') {
          const spotifyTrackForPlayer: SpotifyTrack = {
            id: alarm.audioTrack.id.replace('spotify_', ''),
            name: alarm.audioTrack.name,
            artists: alarm.audioTrack.artist
              ? [{ name: alarm.audioTrack.artist }]
              : [],
            preview_url: alarm.audioTrack.uri,
            external_urls: { spotify: '' },
            duration_ms: alarm.audioTrack.duration || 0,
            album: {
              id: '',
              name: 'Album',
              images: alarm.audioTrack.artworkUrl
                ? [{ url: alarm.audioTrack.artworkUrl }]
                : [],
            },
          };
          setSpotifyTrack(spotifyTrackForPlayer);
          setShowSpotifyPlayer(true);
        }
      }
    };

    checkAlarmState();

    return () => {
      clearInterval(timeInterval);
      StatusBar.setHidden(false);
      // Audio cleanup is handled by AlarmService, not here
    };
  }, [alarm]);

  const handleSlideGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    const progress = Math.max(
      0,
      Math.min(translationX, SLIDER_WIDTH - THUMB_SIZE)
    );

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
    setShowSpotifyPlayer(false); // Close player on dismiss
    try {
      await alarmService.stopRingingAlarm();

      if (alarm && !alarm.repeatDays?.length) {
        // Deactivate one-time alarms instead of deleting them
        const { updateAlarm } = useAlarmStore.getState();
        await updateAlarm(alarm.id, { isActive: false });
      }

      await replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Failed to dismiss alarm:', error);
    }
  };

  const handleSnooze = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('Snooze Alarm', 'How long would you like to snooze?', [
      { text: '5 minutes', onPress: () => snoozeAlarm(5) },
      { text: '10 minutes', onPress: () => snoozeAlarm(10) },
      { text: '15 minutes', onPress: () => snoozeAlarm(15) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const snoozeAlarm = async (minutes: number) => {
    await alarmService.stopRingingAlarm();

    // For one-time alarms, also deactivate them after snooze
    if (alarm && !alarm.repeatDays?.length) {
      const { updateAlarm } = useAlarmStore.getState();
      await updateAlarm(alarm.id, { isActive: false });
    }

    // Here you would implement snooze logic
    console.log(`Snoozed for ${minutes} minutes`);
    await replace('/(tabs)/dashboard');
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
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!alarm) {
    return (
      <ThemedView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <ThemedText>Alarm not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#000000' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Spotify Player Modal */}
        {spotifyTrack && (
          <SpotifyWebPlayer
            isVisible={showSpotifyPlayer}
            track={spotifyTrack}
            accessToken={spotifyToken || ''}
            onClose={() => setShowSpotifyPlayer(false)}
            onPlaybackError={error => {
              Alert.alert('Spotify Error', error.message);
              setShowSpotifyPlayer(false);
            }}
          />
        )}

        {/* Clean Background - no animation */}

        {/* Header - Emergency Stop */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 16,
          }}
        >
          <TouchableOpacity onPress={handleEmergencyStop}>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
              {tapCount > 0
                ? `Tap ${5 - tapCount} more times to stop`
                : 'Emergency stop'}
            </ThemedText>
          </TouchableOpacity>

          <View
            style={{
              backgroundColor: APP_COLORS.primary,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <ThemedText
              style={{ fontSize: 10, fontWeight: '600', color: '#FFFFFF' }}
            >
              ALARM
            </ThemedText>
          </View>
        </View>

        {/* Main Content */}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          {/* Alarm Icon */}
          <View style={{ marginBottom: 40 }}>
            <View
              style={{
                backgroundColor: APP_COLORS.primary,
                borderRadius: 50,
                padding: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="alarm" size={80} color="#FFFFFF" />
            </View>
          </View>

          {/* Time Display */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <ThemedText
              style={{
                fontSize: 72,
                fontWeight: '800',
                color: APP_COLORS.primary,
                textAlign: 'center',
              }}
            >
              {formatTime(currentTime)}
            </ThemedText>

            <ThemedText
              style={{
                fontSize: 18,
                marginTop: 8,
                textAlign: 'center',
                opacity: 0.7,
              }}
            >
              {formatDate(currentTime)}
            </ThemedText>
          </View>

          {/* Alarm Info */}
          <View
            style={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#374151' : '#E5E7EB',
              borderRadius: 12,
              padding: 16,
              marginBottom: 48,
              width: '100%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="musical-notes"
                size={20}
                color={APP_COLORS.accent}
              />
              <ThemedText
                style={{ fontSize: 16, fontWeight: '600', marginLeft: 8 }}
              >
                {alarm.audioTrack.name}
              </ThemedText>
            </View>

            <ThemedText
              style={{
                fontSize: 12,
                textAlign: 'center',
                marginTop: 8,
                opacity: 0.7,
              }}
            >
              {alarm.title}
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
            {/* Snooze Button */}
            <TouchableOpacity
              onPress={handleSnooze}
              style={{
                backgroundColor: theme.elevated,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time" size={20} color={APP_COLORS.accent} />
                <ThemedText
                  style={{ fontSize: 14, fontWeight: '600', marginLeft: 6 }}
                >
                  Snooze
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* Spotify Player Button - only show for Spotify tracks */}
            {alarm.audioTrack.type === 'spotify' && spotifyTrack && (
              <TouchableOpacity
                onPress={() => setShowSpotifyPlayer(true)}
                style={{
                  backgroundColor: '#1DB954',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="musical-note" size={20} color="#FFFFFF" />
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      marginLeft: 6,
                      color: '#FFFFFF',
                    }}
                  >
                    Play Full Song
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Slide to Dismiss */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 48 }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>
              Slide to dismiss alarm
            </ThemedText>
          </View>

          <View
            style={{
              height: THUMB_SIZE,
              width: SLIDER_WIDTH,
              marginHorizontal: (SCREEN_WIDTH - SLIDER_WIDTH) / 2,
              backgroundColor: theme.elevated,
              borderRadius: 35,
              position: 'relative',
            }}
          >
            {/* Slider Track */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 35,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />

            {/* Progress Fill */}
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                backgroundColor: APP_COLORS.primary,
                borderRadius: 35,
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
                if (nativeEvent.state === 5) {
                  // End state
                  handleSlideEnd({
                    nativeEvent,
                  } as PanGestureHandlerGestureEvent);
                }
              }}
            >
              <Animated.View
                style={{
                  position: 'absolute',
                  backgroundColor: '#FFFFFF',
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: 35,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  left: slideAnimation,
                }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={isSliding ? APP_COLORS.primary : '#666666'}
                />
              </Animated.View>
            </PanGestureHandler>

            {/* Slide Text */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ThemedText
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
