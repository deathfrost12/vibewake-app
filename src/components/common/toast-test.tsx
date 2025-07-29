import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../ui/button';
import { useCzechToasts } from '../ui/toast';

/**
 * 🍞 Toast Notifications Test Panel
 *
 * Comprehensive testing interface for Czech educational toast system
 */
export default function ToastTest() {
  const toasts = useCzechToasts();

  return (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-secondary-800 mb-4">
        🍞 Toast Notifications Test
      </Text>

      <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
        {/* Success Toasts */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            ✅ Success Messages
          </Text>

          <View className="gap-2">
            <Button
              title="🎉 Study Success"
              onPress={() => toasts.studySuccess('Český jazyk', 15)}
              size="sm"
              variant="primary"
              className="w-full"
            />

            <Button
              title="✅ Study Complete"
              onPress={() => toasts.studyComplete('Matematika', 85)}
              size="sm"
              variant="primary"
              className="w-full"
            />

            <Button
              title="☁️ Sync Success"
              onPress={() => toasts.syncSuccess()}
              size="sm"
              variant="primary"
              className="w-full"
            />

            <Button
              title="🎭 Magic Notes Success"
              onPress={() => toasts.magicNotesSuccess(12)}
              size="sm"
              variant="primary"
              className="w-full"
            />
          </View>
        </View>

        {/* Error Toasts */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            ❌ Error Messages
          </Text>

          <View className="gap-2">
            <Button
              title="�� Network Error"
              onPress={() =>
                toasts.networkError(() => console.log('Retry pressed'))
              }
              size="sm"
              variant="secondary"
              className="w-full"
            />

            <Button
              title="☁️ Sync Error"
              onPress={() => toasts.syncError()}
              size="sm"
              variant="secondary"
              className="w-full"
            />

            <Button
              title="🎭 Magic Notes Error"
              onPress={() => toasts.magicNotesError()}
              size="sm"
              variant="secondary"
              className="w-full"
            />
          </View>
        </View>

        {/* Achievement Toasts */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            🏆 Achievements & Streaks
          </Text>

          <View className="gap-2">
            <Button
              title="🔥 Streak 7 Days"
              onPress={() => toasts.streakAchieved(7)}
              size="sm"
              variant="outline"
              className="w-full"
            />

            <Button
              title="�� Achievement Unlock"
              onPress={() =>
                toasts.achievementUnlocked(
                  'Týden studia',
                  'Dokázal/a jsi studovat 7 dní v řadě!'
                )
              }
              size="sm"
              variant="outline"
              className="w-full"
            />
          </View>
        </View>

        {/* Info & Warning Toasts */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            ℹ️ Info & Warnings
          </Text>

          <View className="gap-2">
            <Button
              title="📚 Study Reminder"
              onPress={() =>
                toasts.studyReminder('Dějepis', () =>
                  console.log('Navigate to study')
                )
              }
              size="sm"
              variant="outline"
              className="w-full"
            />

            <Button
              title="⚠️ Low Progress"
              onPress={() => toasts.lowProgress()}
              size="sm"
              variant="outline"
              className="w-full"
            />

            <Button
              title="ℹ️ Quick Info"
              onPress={() => toasts.quickInfo('Tohle je testovací informace')}
              size="sm"
              variant="outline"
              className="w-full"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            ⚡ Quick Actions
          </Text>

          <View className="gap-2">
            <Button
              title="✅ Quick Success"
              onPress={() => toasts.quickSuccess('Úloha dokončena úspěšně!')}
              size="sm"
              variant="primary"
              className="w-full"
            />

            <Button
              title="❌ Quick Error"
              onPress={() => toasts.quickError('Něco se pokazilo!')}
              size="sm"
              variant="secondary"
              className="w-full"
            />
          </View>
        </View>

        {/* Multiple Toasts Test */}
        <View className="mb-4">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            📚 Multiple Toasts Test
          </Text>

          <Button
            title="🚀 Show Multiple Toasts"
            onPress={() => {
              setTimeout(() => toasts.quickInfo('První toast'), 0);
              setTimeout(() => toasts.studySuccess('Český jazyk', 10), 500);
              setTimeout(() => toasts.streakAchieved(5), 1000);
              setTimeout(
                () =>
                  toasts.achievementUnlocked(
                    'Multi Test',
                    'Testování více toasts najednou!'
                  ),
                1500
              );
            }}
            size="md"
            variant="primary"
            className="w-full"
          />
        </View>
      </ScrollView>

      {/* Instructions */}
      <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
        <Text className="text-lg font-semibold text-blue-700 mb-2">
          📋 Toast Instructions
        </Text>
        <Text className="text-sm text-blue-600 leading-5">
          • Toasts se zobrazují nahoře se smooth animacemi{'\n'}• Multiple
          toasts se stackují vertikálně{'\n'}• Tap na toast nebo action button
          pro interakci{'\n'}• Auto-dismiss po 2-5 sekundách dle typu{'\n'}•
          Czech educational context ve všech zprávách{'\n'}• Magical Green
          branding pro streak toasts
        </Text>
      </View>
    </View>
  );
}
