import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmCreateData, AlarmUpdateData } from '../types/alarm';

// Re-export Alarm for backward compatibility
export type { Alarm } from '../types/alarm';
import { notificationService } from '../services/notifications/notification-service';
import { AudioTrack } from '../services/audio/types';
import { alarmService } from '../services/alarms/alarm-service';
import { backgroundTaskService } from '../services/background/background-task-service';

interface AlarmState {
  alarms: Alarm[];
  permissionsGranted: boolean;
  isLoading: boolean;

  // Actions
  createAlarm: (alarm: AlarmCreateData) => Promise<string>;
  updateAlarm: (id: string, updates: AlarmUpdateData) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  checkPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  loadAlarms: () => Promise<void>;
  syncScheduledAlarms: () => Promise<void>;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: [],
      permissionsGranted: false,
      isLoading: false,

      createAlarm: async alarmData => {
        const id = `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const alarm: Alarm = {
          ...alarmData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({ isLoading: true });

        try {
          // Schedule the alarm if active (uses AlarmKit or notifications)
          if (alarm.isActive) {
            await alarmService.scheduleAlarm(alarm);
            console.log('⏰ Created and scheduled alarm:', id);
          }

          set(state => ({
            alarms: [...state.alarms, alarm],
            isLoading: false,
          }));

          return id;
        } catch (error) {
          console.error('⏰ Failed to create alarm:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateAlarm: async (id, updates) => {
        set({ isLoading: true });

        try {
          const alarm = get().alarms.find(a => a.id === id);
          if (!alarm) {
            throw new Error('Alarm not found');
          }

          // Cancel existing notification if it exists
          if (alarm.notificationId) {
            await notificationService.cancelAlarm(alarm.notificationId);
          }

          const updatedAlarm: Alarm = {
            ...alarm,
            ...updates,
            updatedAt: new Date(),
            notificationId: undefined, // Reset notification ID
          };

          // Only schedule new alarm if alarm is being activated
          if (updatedAlarm.isActive) {
            try {
              await alarmService.scheduleAlarm(updatedAlarm);
              console.log('⏰ Updated and rescheduled alarm:', id);
            } catch (scheduleError) {
              console.error(
                '⏰ Failed to schedule updated alarm:',
                scheduleError
              );
              // Keep alarm active but without notification - user can manually fix
              console.log(
                '⏰ Alarm updated but notification scheduling failed - alarm remains active'
              );
            }
          } else {
            console.log('⏰ Updated alarm (inactive):', id);
          }

          set(state => ({
            alarms: state.alarms.map(a => (a.id === id ? updatedAlarm : a)),
            isLoading: false,
          }));
        } catch (error) {
          console.error('⏰ Failed to update alarm:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      deleteAlarm: async id => {
        set({ isLoading: true });

        try {
          const alarm = get().alarms.find(a => a.id === id);
          if (alarm?.notificationId) {
            await notificationService.cancelAlarm(alarm.notificationId);
          }

          set(state => ({
            alarms: state.alarms.filter(a => a.id !== id),
            isLoading: false,
          }));

          console.log('⏰ Deleted alarm:', id);
        } catch (error) {
          console.error('⏰ Failed to delete alarm:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      toggleAlarm: async id => {
        const alarm = get().alarms.find(a => a.id === id);
        if (!alarm) return;

        // Optimistic update - update UI immediately
        const newActiveState = !alarm.isActive;
        set(state => ({
          alarms: state.alarms.map(a =>
            a.id === id
              ? { ...a, isActive: newActiveState, updatedAt: new Date() }
              : a
          ),
        }));

        try {
          // Handle notification scheduling in background
          if (alarm.notificationId) {
            await notificationService.cancelAlarm(alarm.notificationId);
          }


          // Only schedule if activating the alarm
          if (newActiveState) {
            try {
              await alarmService.scheduleAlarm({
                ...alarm,
                isActive: newActiveState,
              });
              console.log('⏰ Toggled and scheduled alarm:', id);
            } catch (scheduleError) {
              console.error(
                '⏰ Failed to schedule toggled alarm:',
                scheduleError
              );
              // Keep optimistic update but log error
            }
          } else {
            console.log('⏰ Toggled alarm off:', id);
          }

          // Update alarm state
          set(state => ({
            alarms: state.alarms.map(a =>
              a.id === id ? { ...a, updatedAt: new Date() } : a
            ),
          }));
        } catch (error) {
          // Revert optimistic update on error
          console.error('⏰ Failed to toggle alarm, reverting:', error);
          set(state => ({
            alarms: state.alarms.map(a =>
              a.id === id
                ? { ...a, isActive: alarm.isActive, updatedAt: new Date() }
                : a
            ),
          }));
          throw error;
        }
      },

      checkPermissions: async () => {
        const permissions = await notificationService.requestPermissions();
        set({ permissionsGranted: permissions.granted });
        return permissions.granted;
      },

      requestPermissions: async () => {
        const permissions = await notificationService.requestPermissions();
        set({ permissionsGranted: permissions.granted });
        return permissions.granted;
      },

      loadAlarms: async () => {
        set({ isLoading: true });

        try {
          // Initialize all alarm-related services
          await alarmService.initialize();
          await backgroundTaskService.initialize();

          // Check permissions
          await get().checkPermissions();

          // Sync any desynced alarms
          await get().syncScheduledAlarms();

          set({ isLoading: false });
          console.log(
            '⏰ Loaded alarms with background support:',
            get().alarms.length
          );
        } catch (error) {
          console.error('⏰ Failed to load alarms:', error);
          set({ isLoading: false });
        }
      },

      syncScheduledAlarms: async () => {
        try {
          const scheduledNotifications =
            await notificationService.getAllScheduledAlarms();
          const alarms = get().alarms;

          // Find alarms that are marked as active but don't have scheduled notifications
          const desyncedAlarms = alarms.filter(
            alarm =>
              alarm.isActive &&
              !scheduledNotifications.find(
                notif => notif.content.data?.alarmId === alarm.id
              )
          );

          // Reschedule desynced alarms
          for (const alarm of desyncedAlarms) {
            try {
              await alarmService.scheduleAlarm(alarm);

              set(state => ({
                alarms: state.alarms.map(a =>
                  a.id === alarm.id
                    ? { ...a, updatedAt: new Date() }
                    : a
                ),
              }));

              console.log('⏰ Resynced alarm:', alarm.id);
            } catch (error) {
              console.error('⏰ Failed to resync alarm:', alarm.id, error);
            }
          }

          console.log(
            '⏰ Synced scheduled alarms, resynced:',
            desyncedAlarms.length
          );
        } catch (error) {
          console.error('⏰ Failed to sync scheduled alarms:', error);
        }
      },
    }),
    {
      name: 'alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        alarms: state.alarms,
        permissionsGranted: state.permissionsGranted,
      }),
      onRehydrateStorage: () => state => {
        if (state?.alarms) {
          // Convert date strings back to Date objects
          state.alarms = state.alarms.map(alarm => ({
            ...alarm,
            time:
              typeof alarm.time === 'string'
                ? new Date(alarm.time)
                : alarm.time,
            createdAt:
              typeof alarm.createdAt === 'string'
                ? new Date(alarm.createdAt)
                : alarm.createdAt,
            updatedAt:
              typeof alarm.updatedAt === 'string'
                ? new Date(alarm.updatedAt)
                : alarm.updatedAt,
          }));
        }
      },
    }
  )
);
