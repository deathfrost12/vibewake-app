import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';
import {
  ThemedView,
  ThemedText,
  ThemedCard,
} from '../../components/ui/themed-view';
import { useAlarmStore } from '../../stores/alarm-store';
import { Alarm } from '../../stores/alarm-store';

export default function AlarmsScreen() {
  const { alarms, isLoading, loadAlarms, toggleAlarm, deleteAlarm } =
    useAlarmStore();
  const { isDark } = useTheme();

  // Load alarms only once on mount
  useEffect(() => {
    loadAlarms();
  }, []);

  // Handle alarm deletion with confirmation
  const handleDeleteAlarm = useCallback(
    (alarmId: string) => {
      Alert.alert(
        'Delete Alarm',
        'Are you sure you want to delete this alarm?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteAlarm(alarmId),
          },
        ]
      );
    },
    [deleteAlarm]
  );

  // Handle three dots menu - custom dialog like in the image
  const handleThreeDotsMenu = useCallback(
    (alarm: Alarm) => {
      Alert.alert(
        '',
        '',
        [
          {
            text: '🗑️ Smazat',
            style: 'destructive',
            onPress: () => handleDeleteAlarm(alarm.id),
          },
          {
            text: '👁️ Náhled budíku.',
            onPress: () =>
              Alert.alert('Info', 'Preview functionality coming soon!'),
          },
          {
            text: '📋 Duplikovat budík.',
            onPress: () =>
              Alert.alert('Info', 'Duplicate functionality coming soon!'),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    },
    [handleDeleteAlarm]
  );

  // Render delete action for swipe - floating button design
  const renderDeleteAction = useCallback(
    (alarmId: string) => {
      return (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            height: '100%',
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#FF6B6B',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={() => handleDeleteAlarm(alarmId)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    },
    [handleDeleteAlarm]
  );

  // Format days for display
  const formatDays = useCallback((days?: number[]) => {
    if (!days || days.length === 0) return 'Once';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.every(day => day >= 1 && day <= 5))
      return 'Mon-Fri';
    if (days.length === 2 && days.includes(0) && days.includes(6))
      return 'Weekend';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days
      .sort()
      .map(day => dayNames[day])
      .join(', ');
  }, []);

  // Format time for display
  const formatTime = useCallback((time: Date | string) => {
    const dateObj = typeof time === 'string' ? new Date(time) : time;
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '00:00';
    }
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Get next alarm - finds the alarm that occurs next after current time
  const getNextAlarm = useCallback(() => {
    const enabledAlarms = alarms.filter(alarm => alarm.isActive);
    if (enabledAlarms.length === 0) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    let nextAlarm: Alarm | null = null;
    let minTimeToNext = Infinity;

    enabledAlarms.forEach(alarm => {
      const alarmTime = new Date(alarm.time);
      const alarmMinutes = alarmTime.getHours() * 60 + alarmTime.getMinutes();

      // If no repeat days, it's a one-time alarm
      if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
        // One-time alarm - check if it's still today and after current time
        if (alarmMinutes > currentTime) {
          const timeToNext = alarmMinutes - currentTime;
          if (timeToNext < minTimeToNext) {
            minTimeToNext = timeToNext;
            nextAlarm = alarm;
          }
        }
        // Note: one-time alarms that have passed today are not considered for future days
        return;
      }

      // Repeating alarm - find next occurrence
      for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
        const checkDay = (currentDay + daysAhead) % 7;
        const isAlarmDay = alarm.repeatDays.includes(checkDay);

        if (isAlarmDay) {
          let timeToNext;
          if (daysAhead === 0) {
            // Today - only if alarm time is in the future
            if (alarmMinutes > currentTime) {
              timeToNext = alarmMinutes - currentTime;
            } else {
              continue; // Skip to next day
            }
          } else {
            // Future day
            timeToNext = daysAhead * 24 * 60 + alarmMinutes - currentTime;
          }

          if (timeToNext < minTimeToNext) {
            minTimeToNext = timeToNext;
            nextAlarm = alarm;
          }
          break; // Found next occurrence for this alarm
        }
      }
    });

    return nextAlarm;
  }, [alarms]);

  const nextAlarm = getNextAlarm();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  // Get time until next alarm
  const getTimeToNextAlarm = useCallback(() => {
    if (!nextAlarm) return null;

    // Type guard to ensure nextAlarm is not null
    const alarm = nextAlarm as Alarm;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();

    const alarmTime = new Date(alarm.time);
    const alarmMinutes = alarmTime.getHours() * 60 + alarmTime.getMinutes();

    let timeToNext = 0;

    // One-time alarm
    if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
      if (alarmMinutes > currentTime) {
        timeToNext = alarmMinutes - currentTime;
      }
    } else {
      // Repeating alarm - find next occurrence
      for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
        const checkDay = (currentDay + daysAhead) % 7;
        const isAlarmDay = alarm.repeatDays.includes(checkDay);

        if (isAlarmDay) {
          if (daysAhead === 0 && alarmMinutes > currentTime) {
            timeToNext = alarmMinutes - currentTime;
          } else if (daysAhead > 0) {
            timeToNext = daysAhead * 24 * 60 + alarmMinutes - currentTime;
          } else {
            continue;
          }
          break;
        }
      }
    }

    const hours = Math.floor(timeToNext / 60);
    const minutes = timeToNext % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, [nextAlarm]);

  // Render week days row or "Jednorázový" - pro top left pozici
  const renderWeekDays = useCallback(
    (activedays: number[] = []) => {
      // If no repeat days, show "Jednorázový"
      if (!activedays || activedays.length === 0) {
        return (
          <View style={{ height: 24, justifyContent: 'center' }}>
            <ThemedText
              style={{
                fontSize: 14,
                opacity: 0.7,
                textAlign: 'left',
                fontWeight: '600',
              }}
            >
              Jednorázový
            </ThemedText>
          </View>
        );
      }

      const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
      return (
        <View
          style={{
            flexDirection: 'row',
            gap: 4,
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
          }}
        >
          {dayNames.map((day, index) => {
            const isActive =
              activedays.includes(index + 1) ||
              (index === 6 && activedays.includes(0));
            return (
              <View
                key={day}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: isActive ? APP_COLORS.primary : theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '600',
                    color: isActive ? '#FFFFFF' : theme.text.muted,
                  }}
                >
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      );
    },
    [theme]
  );

  // Render individual alarm item
  const renderAlarmItem = useCallback(
    ({ item: alarm }: { item: Alarm }) => {
      return (
        <Swipeable
          key={alarm.id}
          renderRightActions={() => renderDeleteAction(alarm.id)}
        >
          <TouchableOpacity
            style={{
              backgroundColor: theme.elevated,
              borderWidth: 1,
              borderColor: alarm.isActive ? APP_COLORS.primary : theme.border,
              borderRadius: 12,
              padding: 24,
              marginBottom: 12,
              minHeight: 140, // Ensure consistent height
            }}
            activeOpacity={0.8}
            onPress={() => router.push('/alarms/create')}
          >
            {/* Main layout container */}
            <View style={{ flex: 1 }}>
              {/* Top row: Days vlevo nahoře + Toggle switch */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 0,
                }}
              >
                {/* Dny v týdnu - vlevo nahoře */}
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  {renderWeekDays(alarm.repeatDays)}
                </View>

                {/* Toggle switch */}
                <TouchableOpacity
                  style={{
                    width: 56,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: alarm.isActive
                      ? APP_COLORS.primary
                      : theme.border,
                    padding: 2,
                    justifyContent: 'center',
                    marginLeft: 12,
                  }}
                  activeOpacity={0.8}
                  onPress={() => toggleAlarm(alarm.id)}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#FFFFFF',
                      marginLeft: alarm.isActive ? 28 : 0,
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* Center area: Čas - větší pod dny */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  marginVertical: 4,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 56,
                    fontWeight: 'bold',
                    textAlign: 'left',
                  }}
                >
                  {formatTime(alarm.time)}
                </ThemedText>
              </View>

              {/* Bottom content area */}
              <View>
                {/* Bottom row: Song/Mission info + Three dots menu */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    {/* Song info */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <Ionicons
                        name="musical-notes"
                        size={14}
                        color={
                          alarm.isActive ? APP_COLORS.accent : theme.text.muted
                        }
                      />
                      <ThemedText
                        style={{
                          fontSize: 12,
                          color: alarm.isActive
                            ? APP_COLORS.accent
                            : theme.text.muted,
                          marginLeft: 8,
                        }}
                      >
                        {alarm.audioTrack.name}
                      </ThemedText>
                    </View>

                    {/* Mission type */}
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={14}
                        color={APP_COLORS.primary}
                      />
                      <ThemedText
                        style={{
                          fontSize: 11,
                          color: theme.text.muted,
                          marginLeft: 6,
                          opacity: 0.8,
                        }}
                      >
                        Mise - počítání
                      </ThemedText>
                    </View>
                  </View>

                  {/* Three dots menu - bottom right corner */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ padding: 4, alignItems: 'flex-end' }}
                    onPress={() => handleThreeDotsMenu(alarm)}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={theme.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [
      theme,
      renderDeleteAction,
      formatTime,
      toggleAlarm,
      renderWeekDays,
      handleThreeDotsMenu,
    ]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={alarms}
          keyExtractor={item => item.id}
          renderItem={renderAlarmItem}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {/* Header with greeting */}
              <View style={{ marginTop: 24, marginBottom: 32 }}>
                <ThemedText
                  style={{ fontSize: 32, fontWeight: 'bold', lineHeight: 40 }}
                >
                  Good Evening,{' '}
                  <Text style={{ color: APP_COLORS.primary }}>Daniel</Text>
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    marginTop: 8,
                    opacity: 0.7,
                  }}
                >
                  Ready to wake up? ✨
                </ThemedText>
              </View>

              {/* Next Alarm Hero Card */}
              {nextAlarm ? (
                (() => {
                  const alarm = nextAlarm as Alarm;
                  return (
                    <ThemedCard
                      style={{
                        padding: 24,
                        marginBottom: 16,
                        borderRadius: 12,
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push('/alarms/create')}
                      >
                        {/* Main layout container */}
                        <View style={{ flex: 1 }}>
                          {/* Header with next alarm indicator */}
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
                                fontSize: 14,
                                color: APP_COLORS.primary,
                                fontWeight: '600',
                              }}
                            >
                              🌅 NEXT ALARM
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

                          {/* Top row: Days vlevo nahoře + Status indicator */}
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: 0,
                            }}
                          >
                            {/* Dny v týdnu - vlevo nahoře */}
                            <View style={{ flex: 1, alignItems: 'flex-start' }}>
                              {renderWeekDays(alarm.repeatDays)}
                            </View>

                            {/* Active indicator */}
                            <View
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: APP_COLORS.primary,
                                marginLeft: 12,
                              }}
                            />
                          </View>

                          {/* Center area: Čas - větší pod dny */}
                          <View
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'flex-start',
                              marginVertical: 4,
                            }}
                          >
                            <ThemedText
                              style={{
                                fontSize: 56,
                                fontWeight: 'bold',
                                textAlign: 'left',
                              }}
                            >
                              {formatTime(alarm.time)}
                            </ThemedText>
                          </View>

                          {/* Bottom content area */}
                          <View>
                            {/* Bottom row: Song/Mission info */}
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                              }}
                            >
                              <View style={{ flex: 1 }}>
                                {/* Song info */}
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 4,
                                  }}
                                >
                                  <Ionicons
                                    name="musical-notes"
                                    size={14}
                                    color={APP_COLORS.accent}
                                  />
                                  <ThemedText
                                    style={{
                                      fontSize: 12,
                                      color: APP_COLORS.accent,
                                      marginLeft: 8,
                                    }}
                                  >
                                    {alarm.audioTrack.name}
                                  </ThemedText>
                                </View>

                                {/* Mission type */}
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Ionicons
                                    name="checkmark-circle-outline"
                                    size={14}
                                    color={APP_COLORS.primary}
                                  />
                                  <ThemedText
                                    style={{
                                      fontSize: 11,
                                      color: theme.text.muted,
                                      marginLeft: 6,
                                      opacity: 0.8,
                                    }}
                                  >
                                    Mise - počítání
                                  </ThemedText>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </ThemedCard>
                  );
                })()
              ) : (
                <ThemedCard
                  style={{ padding: 24, marginBottom: 32, borderRadius: 12 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push('/alarms/create')}
                  >
                    <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                      <Ionicons
                        name="add-circle-outline"
                        size={48}
                        color={theme.text.secondary}
                      />
                      <ThemedText
                        style={{
                          fontSize: 20,
                          fontWeight: '600',
                          marginTop: 12,
                        }}
                      >
                        No Alarm Set
                      </ThemedText>
                      <ThemedText
                        style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}
                      >
                        Tap to create your first alarm
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </ThemedCard>
              )}

              {/* Next alarm countdown - only show if there is a next alarm */}
              {nextAlarm && (
                <View style={{ marginBottom: 16, alignItems: 'center' }}>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      opacity: 0.7,
                      textAlign: 'center',
                    }}
                  >
                    Next alarm in {getTimeToNextAlarm()}
                  </ThemedText>
                </View>
              )}

              {/* My Alarms Section Header */}
              <View style={{ marginBottom: 24 }}>
                <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
                  My Alarms
                </ThemedText>
              </View>
            </>
          )}
          ListEmptyComponent={() => (
            <ThemedCard
              style={{
                padding: 24,
                alignItems: 'center',
                borderRadius: 12,
                marginHorizontal: 24,
              }}
            >
              <Ionicons
                name="alarm-outline"
                size={32}
                color={theme.text.secondary}
              />
              <ThemedText
                style={{ fontSize: 16, marginTop: 12, textAlign: 'center' }}
              >
                No alarms yet
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 12,
                  opacity: 0.6,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                Create your first alarm to get started
              </ThemedText>
            </ThemedCard>
          )}
          ListFooterComponent={() => <View style={{ height: 80 }} />}
        />
      </SafeAreaView>
    </ThemedView>
  );
}
