import { Platform } from 'react-native';
import { alarmKitService } from './alarmkit-service';
import { alarmKitAuthService } from './alarmkit-auth-service';
import { notificationService } from '../notifications/notification-service';
import type { Alarm } from '../../types/alarm';

export interface MigrationResult {
  totalAlarms: number;
  migratedAlarms: number;
  failedAlarms: number;
  skippedAlarms: number;
  errors: string[];
}

export interface AlarmMigrationService {
  shouldOfferMigration(): Promise<boolean>;
  migrateAlarmsToAlarmKit(alarms: Alarm[]): Promise<MigrationResult>;
  migrateIndividualAlarm(alarm: Alarm): Promise<boolean>;
  revertToNotifications(alarm: Alarm): Promise<boolean>;
  getMigrationStatus(alarms: Alarm[]): Promise<{
    nativeAlarms: number;
    notificationAlarms: number;
    canMigrate: number;
  }>;
}

class AlarmKitMigrationManagementService implements AlarmMigrationService {
  private static instance: AlarmKitMigrationManagementService;

  static getInstance(): AlarmKitMigrationManagementService {
    if (!AlarmKitMigrationManagementService.instance) {
      AlarmKitMigrationManagementService.instance =
        new AlarmKitMigrationManagementService();
    }
    return AlarmKitMigrationManagementService.instance;
  }

  /**
   * Check if we should offer migration to the user
   */
  async shouldOfferMigration(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    // Check if AlarmKit is available and authorized
    const canUse = await alarmKitService.canUseAlarmKit();
    if (!canUse) {
      return false;
    }

    // Don't offer if user has already seen onboarding
    // (This could be tracked in AsyncStorage or user preferences)
    return true;
  }

  /**
   * Migrate multiple alarms to AlarmKit
   */
  async migrateAlarmsToAlarmKit(alarms: Alarm[]): Promise<MigrationResult> {
    const result: MigrationResult = {
      totalAlarms: alarms.length,
      migratedAlarms: 0,
      failedAlarms: 0,
      skippedAlarms: 0,
      errors: [],
    };

    if (!(await alarmKitService.canUseAlarmKit())) {
      result.errors.push('AlarmKit is not available or not authorized');
      result.skippedAlarms = alarms.length;
      return result;
    }

    console.log(
      `🔄 Starting migration of ${alarms.length} alarms to AlarmKit...`
    );

    for (const alarm of alarms) {
      try {
        // Skip if already native
        if (alarm.isNativeAlarm) {
          console.log(`⏩ Skipping already native alarm: ${alarm.id}`);
          result.skippedAlarms++;
          continue;
        }

        // Skip if inactive
        if (!alarm.isActive) {
          console.log(`⏩ Skipping inactive alarm: ${alarm.id}`);
          result.skippedAlarms++;
          continue;
        }

        const migrated = await this.migrateIndividualAlarm(alarm);
        if (migrated) {
          result.migratedAlarms++;
          console.log(`✅ Successfully migrated alarm: ${alarm.id}`);
        } else {
          result.failedAlarms++;
          result.errors.push(`Failed to migrate alarm: ${alarm.id}`);
        }
      } catch (error) {
        result.failedAlarms++;
        const errorMessage = `Error migrating alarm ${alarm.id}: ${error}`;
        result.errors.push(errorMessage);
        console.error('❌', errorMessage);
      }
    }

    console.log(`🏁 Migration completed:`, {
      migrated: result.migratedAlarms,
      failed: result.failedAlarms,
      skipped: result.skippedAlarms,
    });

    return result;
  }

  /**
   * Migrate a single alarm to AlarmKit
   */
  async migrateIndividualAlarm(alarm: Alarm): Promise<boolean> {
    if (!(await alarmKitService.canUseAlarmKit())) {
      console.warn(
        `⚠️ Cannot migrate alarm ${alarm.id}: AlarmKit not available`
      );
      return false;
    }

    try {
      console.log(`🔄 Migrating individual alarm to AlarmKit: ${alarm.id}`);

      // Step 1: Cancel existing notification alarm
      if (alarm.notificationIds && alarm.notificationIds.length > 0) {
        console.log(
          `🗑️ Cancelling existing notifications for alarm: ${alarm.id}`
        );
        for (const notificationId of alarm.notificationIds) {
          try {
            await notificationService.cancelAlarm(notificationId);
          } catch (error) {
            console.warn(
              `⚠️ Failed to cancel notification ${notificationId}:`,
              error
            );
          }
        }
      }

      // Step 2: Schedule with AlarmKit
      console.log(`📅 Scheduling alarm with AlarmKit: ${alarm.id}`);
      const nativeAlarmId = await alarmKitService.scheduleNativeAlarm(alarm);

      // Step 3: Update alarm metadata
      alarm.nativeAlarmId = nativeAlarmId;
      alarm.isNativeAlarm = true;
      alarm.notificationIds = []; // Clear old notification IDs

      console.log(
        `✅ Successfully migrated alarm to AlarmKit: ${alarm.id} -> ${nativeAlarmId}`
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to migrate alarm ${alarm.id} to AlarmKit:`,
        error
      );
      return false;
    }
  }

  /**
   * Revert an alarm from AlarmKit back to notifications
   */
  async revertToNotifications(alarm: Alarm): Promise<boolean> {
    try {
      console.log(
        `🔄 Reverting alarm from AlarmKit to notifications: ${alarm.id}`
      );

      // Step 1: Cancel AlarmKit alarm if it exists
      if (alarm.isNativeAlarm && alarm.nativeAlarmId) {
        console.log(`🗑️ Cancelling AlarmKit alarm: ${alarm.nativeAlarmId}`);
        try {
          await alarmKitService.cancelNativeAlarm(alarm.nativeAlarmId);
        } catch (error) {
          console.warn(`⚠️ Failed to cancel AlarmKit alarm:`, error);
          // Continue with migration even if cancellation fails
        }
      }

      // Step 2: Schedule with notifications
      if (alarm.isActive) {
        console.log(`📱 Scheduling alarm with notifications: ${alarm.id}`);
        const alarmNotification = {
          id: alarm.id,
          title: alarm.title || 'Alarm',
          time: alarm.time,
          isActive: alarm.isActive,
          audioTrack: alarm.audioTrack,
          repeatDays: alarm.repeatDays,
        };

        const notificationId =
          await notificationService.scheduleAlarm(alarmNotification);
        alarm.notificationIds = notificationId.split(',');
      }

      // Step 3: Update alarm metadata
      alarm.isNativeAlarm = false;
      alarm.nativeAlarmId = undefined;

      console.log(
        `✅ Successfully reverted alarm to notifications: ${alarm.id}`
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to revert alarm ${alarm.id} to notifications:`,
        error
      );
      return false;
    }
  }

  /**
   * Get migration status for a set of alarms
   */
  async getMigrationStatus(alarms: Alarm[]): Promise<{
    nativeAlarms: number;
    notificationAlarms: number;
    canMigrate: number;
  }> {
    const canUseAlarmKit = await alarmKitService.canUseAlarmKit();

    let nativeAlarms = 0;
    let notificationAlarms = 0;
    let canMigrate = 0;

    for (const alarm of alarms) {
      if (alarm.isNativeAlarm) {
        nativeAlarms++;
      } else {
        notificationAlarms++;

        // Count alarms that can be migrated (active and AlarmKit available)
        if (alarm.isActive && canUseAlarmKit) {
          canMigrate++;
        }
      }
    }

    return {
      nativeAlarms,
      notificationAlarms,
      canMigrate,
    };
  }

  /**
   * Batch migrate all eligible alarms
   */
  async migrateAllEligibleAlarms(alarms: Alarm[]): Promise<MigrationResult> {
    // Filter for alarms that can be migrated
    const eligibleAlarms = alarms.filter(
      alarm => !alarm.isNativeAlarm && alarm.isActive
    );

    if (eligibleAlarms.length === 0) {
      return {
        totalAlarms: 0,
        migratedAlarms: 0,
        failedAlarms: 0,
        skippedAlarms: 0,
        errors: [],
      };
    }

    return await this.migrateAlarmsToAlarmKit(eligibleAlarms);
  }

  /**
   * Get diagnostic information about alarm distribution
   */
  async getDiagnosticInfo(alarms: Alarm[]): Promise<{
    alarmKitAvailable: boolean;
    alarmKitAuthorized: boolean;
    totalAlarms: number;
    activeAlarms: number;
    nativeAlarms: number;
    notificationAlarms: number;
    eligibleForMigration: number;
  }> {
    const alarmKitAvailable = await alarmKitService.isAlarmKitAvailable();
    const alarmKitAuthorized = await alarmKitService.canUseAlarmKit();

    const totalAlarms = alarms.length;
    const activeAlarms = alarms.filter(a => a.isActive).length;
    const nativeAlarms = alarms.filter(a => a.isNativeAlarm).length;
    const notificationAlarms = alarms.filter(a => !a.isNativeAlarm).length;
    const eligibleForMigration = alarms.filter(
      a => !a.isNativeAlarm && a.isActive && alarmKitAuthorized
    ).length;

    return {
      alarmKitAvailable,
      alarmKitAuthorized,
      totalAlarms,
      activeAlarms,
      nativeAlarms,
      notificationAlarms,
      eligibleForMigration,
    };
  }
}

// Export singleton instance
export const alarmKitMigrationService =
  AlarmKitMigrationManagementService.getInstance();
