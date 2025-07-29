import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import usePushNotifications, {
  useStudyReminders,
  useStreakNotifications,
} from '../../hooks/use-push-notifications';
import { Button } from '../ui/button';

/**
 * 🧪 Push Notifications Test Panel pro Repetito
 *
 * Comprehensive testing interface pro všechny notification features
 * s českým educational kontextem
 */
export default function PushNotificationsTest() {
  const {
    isInitialized,
    hasPermission,
    expoPushToken,
    lastNotification,
    error,
    initializeNotifications,
    requestPermissions,
    scheduleStudyReminder,
    scheduleStreakMotivation,
    sendAchievement,
    cancelAllNotifications,
    getDebugInfo,
  } = usePushNotifications();

  const {
    scheduleDaily,
    cancelAll: cancelStudyReminders,
    scheduledRemindersCount,
  } = useStudyReminders();
  const { celebrateStreak } = useStreakNotifications();

  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 🔍 Load debug info
   */
  const loadDebugInfo = async () => {
    try {
      setIsLoading(true);
      const info = await getDebugInfo();
      setDebugInfo(info);
      console.log('🔍 Debug info loaded:', info);
    } catch (error) {
      console.error('❌ Error loading debug info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 📱 Initialize notifications
   */
  const handleInitialize = async () => {
    try {
      setIsLoading(true);
      await initializeNotifications();
      await loadDebugInfo();
      Alert.alert('✅ Úspěch', 'Push notifications inicializovány!');
    } catch (error) {
      Alert.alert('❌ Chyba', `Nepodařilo se inicializovat: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 📝 Request permissions
   */
  const handleRequestPermissions = async () => {
    try {
      setIsLoading(true);
      const granted = await requestPermissions();
      Alert.alert(
        granted ? '✅ Povolení uděleno' : '❌ Povolení zamítnuto',
        granted
          ? 'Push notifications jsou povoleny!'
          : 'Uživatel nepovolil notifikace'
      );
    } catch (error) {
      Alert.alert('❌ Chyba', `Nepodařilo se požádat o povolení: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 📚 Test study reminder
   */
  const handleTestStudyReminder = async () => {
    try {
      setIsLoading(true);
      const reminderTime = new Date(Date.now() + 5000); // 5 seconds
      const notificationId = await scheduleStudyReminder(
        'Český jazyk',
        'maturita',
        reminderTime
      );
      Alert.alert(
        '✅ Připomínka naplánována',
        `ID: ${notificationId}\nZa 5 sekund`
      );
    } catch (error) {
      Alert.alert('❌ Chyba', `Nepodařilo se naplánovat připomínku: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔥 Test streak motivation
   */
  const handleTestStreakMotivation = async () => {
    try {
      setIsLoading(true);
      const notificationId = await scheduleStreakMotivation(7);
      Alert.alert(
        '✅ Streak motivace naplánována',
        `ID: ${notificationId}\nZa 1 minutu`
      );
    } catch (error) {
      Alert.alert('❌ Chyba', `Nepodařilo se naplánovat motivaci: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎉 Test achievement notification
   */
  const handleTestAchievement = async () => {
    try {
      setIsLoading(true);
      await sendAchievement(
        'První test! 🎉',
        'Úspěšně jsi otestoval achievement notifikaci!'
      );
      Alert.alert(
        '✅ Achievement odeslán',
        'Notifikace by se měla zobrazit okamžitě'
      );
    } catch (error) {
      Alert.alert('❌ Chyba', `Nepodařilo se odeslat achievement: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 📅 Test daily reminder
   */
  const handleTestDailyReminder = async () => {
    try {
      setIsLoading(true);
      const reminderId = await scheduleDaily('Matematika', 'maturita', 19, 30);
      Alert.alert(
        '✅ Denní připomínka',
        `Naplánována na 19:30\nID: ${reminderId}`
      );
    } catch (error) {
      Alert.alert(
        '❌ Chyba',
        `Nepodařilo se naplánovat denní připomínku: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔥 Test streak celebration
   */
  const handleTestStreakCelebration = async () => {
    try {
      setIsLoading(true);
      await celebrateStreak(7); // Týden v kuse
      Alert.alert('✅ Streak oslava', 'Oslava 7 dní v řadě spuštěna!');
    } catch (error) {
      Alert.alert('❌ Chyba', `Nepodařilo se oslavit streak: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🧹 Cancel all notifications
   */
  const handleCancelAll = async () => {
    try {
      setIsLoading(true);
      await cancelAllNotifications();
      await cancelStudyReminders();
      Alert.alert(
        '✅ Všechny notifikace zrušeny',
        'Scheduled notifications smazány'
      );
    } catch (error) {
      Alert.alert('❌ Chyba', `Nepodařilo se zrušit notifikace: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔄 Refresh debug info on mount
   */
  useEffect(() => {
    loadDebugInfo();
  }, []);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🔔 Push Notifications Test Panel
      </Text>

      {/* Status Section */}
      <View className="bg-gray-50 p-4 rounded-lg mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          📊 Status
        </Text>

        <View className="space-y-2">
          <Text className="text-sm">
            <Text className="font-medium">Inicializováno:</Text>{' '}
            {isInitialized ? '✅ Ano' : '❌ Ne'}
          </Text>
          <Text className="text-sm">
            <Text className="font-medium">Povolení:</Text>{' '}
            {hasPermission ? '✅ Uděleno' : '❌ Neuděleno'}
          </Text>
          <Text className="text-sm">
            <Text className="font-medium">Push Token:</Text>{' '}
            {expoPushToken ? '✅ Získán' : '❌ Nedostupný'}
          </Text>
          {expoPushToken && (
            <Text className="text-xs text-gray-600 mt-2">
              Token: {expoPushToken.substring(0, 30)}...
            </Text>
          )}
          {error && (
            <Text className="text-sm text-red-600 mt-2">
              <Text className="font-medium">Chyba:</Text> {error}
            </Text>
          )}
        </View>
      </View>

      {/* Last Notification */}
      {lastNotification && (
        <View className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
          <Text className="text-lg font-semibold text-green-700 mb-2">
            📱 Poslední notifikace
          </Text>
          <Text className="text-sm font-medium">
            {lastNotification.request.content.title}
          </Text>
          <Text className="text-sm text-gray-600">
            {lastNotification.request.content.body}
          </Text>
          <Text className="text-xs text-green-600 mt-2">
            {new Date(lastNotification.date).toLocaleString('cs-CZ')}
          </Text>
        </View>
      )}

      {/* Control Buttons */}
      <View className="space-y-3 mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          🎮 Ovládání
        </Text>

        <Button
          title={isInitialized ? '✅ Inicializováno' : '🚀 Inicializovat'}
          onPress={handleInitialize}
          disabled={isLoading || isInitialized}
          className="w-full"
        />

        <Button
          title={
            hasPermission ? '✅ Povolení uděleno' : '📝 Požádat o povolení'
          }
          onPress={handleRequestPermissions}
          disabled={isLoading || hasPermission}
          className="w-full bg-blue-500"
        />
      </View>

      {/* Test Buttons */}
      {hasPermission && (
        <View className="space-y-3 mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-3">
            🧪 Testování
          </Text>

          <Button
            title="📚 Test Study Reminder (5s)"
            onPress={handleTestStudyReminder}
            disabled={isLoading}
            className="w-full bg-purple-500"
          />

          <Button
            title="🔥 Test Streak Motivation (1m)"
            onPress={handleTestStreakMotivation}
            disabled={isLoading}
            className="w-full bg-orange-500"
          />

          <Button
            title="🎉 Test Achievement (okamžitě)"
            onPress={handleTestAchievement}
            disabled={isLoading}
            className="w-full bg-yellow-500"
          />

          <Button
            title="📅 Test Daily Reminder (19:30)"
            onPress={handleTestDailyReminder}
            disabled={isLoading}
            className="w-full bg-indigo-500"
          />

          <Button
            title="🔥 Test Streak Celebration"
            onPress={handleTestStreakCelebration}
            disabled={isLoading}
            className="w-full bg-pink-500"
          />

          <Button
            title="🗑️ Zrušit všechny notifikace"
            onPress={handleCancelAll}
            disabled={isLoading}
            className="w-full bg-red-500"
          />
        </View>
      )}

      {/* Debug Info */}
      <View className="bg-gray-50 p-4 rounded-lg mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-700">
            🔍 Debug Info
          </Text>
          <Button
            title="Refresh"
            onPress={loadDebugInfo}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-500"
            size="sm"
          />
        </View>

        {debugInfo && (
          <View className="space-y-1">
            <Text className="text-xs">Platform: {debugInfo.platform}</Text>
            <Text className="text-xs">
              Device: {debugInfo.isDevice ? 'Physical' : 'Simulator'}
            </Text>
            <Text className="text-xs">OS: {debugInfo.osVersion}</Text>
            <Text className="text-xs">App: {debugInfo.appVersion}</Text>
            <Text className="text-xs">
              Permissions: {debugInfo.permissions}
            </Text>
            <Text className="text-xs">
              Scheduled: {debugInfo.scheduledNotificationsCount}
            </Text>
            <Text className="text-xs">
              Study Reminders: {scheduledRemindersCount}
            </Text>
            {debugInfo.expoPushToken && (
              <Text className="text-xs">
                Token: {debugInfo.expoPushToken.substring(0, 20)}...
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Instructions */}
      <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <Text className="text-lg font-semibold text-blue-700 mb-2">
          📋 Instrukce
        </Text>
        <Text className="text-sm text-blue-600 leading-5">
          1. Nejdříve inicializuj push notifications{'\n'}
          2. Požádej o povolení (na iOS se zobrazí dialog){'\n'}
          3. Testuj různé typy notifikací{'\n'}
          4. Zkontroluj debug info pro detaily{'\n'}
          5. Na simulátoru nebudou notifikace fungovat{'\n'}
          6. Potřebuješ fyzické zařízení pro plné testování
        </Text>
      </View>
    </ScrollView>
  );
}
