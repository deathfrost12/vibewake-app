import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../ui/button';
import { useCzechToasts } from '../ui/toast';

/**
 * 📚 Example of Toast Usage in Study Components
 *
 * This demonstrates how to integrate toast notifications
 * into real study functionality
 */
export default function ToastUsageExample() {
  const toasts = useCzechToasts();

  // Simulate study session completion
  const handleStudyComplete = () => {
    // Simulate API call
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 40) + 60; // 60-100%
      toasts.studyComplete('Český jazyk', randomScore);

      // Check for streak
      const currentStreak = Math.floor(Math.random() * 10) + 1;
      if (currentStreak >= 7) {
        setTimeout(() => {
          toasts.streakAchieved(currentStreak);
        }, 1000);
      }
    }, 500);
  };

  // Simulate Magic Notes processing
  const handleMagicNotes = () => {
    toasts.quickInfo('Zpracovávám tvé poznámky...');

    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate

      if (success) {
        const cardCount = Math.floor(Math.random() * 15) + 5; // 5-20 cards
        toasts.magicNotesSuccess(cardCount);
      } else {
        toasts.magicNotesError();
      }
    }, 2000);
  };

  // Simulate sync operation
  const handleSync = () => {
    toasts.quickInfo('Synchronizuji data...');

    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate

      if (success) {
        toasts.syncSuccess();
      } else {
        toasts.syncError();
      }
    }, 1500);
  };

  // Simulate network error
  const handleNetworkOperation = () => {
    setTimeout(() => {
      toasts.networkError(() => {
        console.log('User pressed retry');
        toasts.quickInfo('Opakuji operaci...');

        setTimeout(() => {
          toasts.quickSuccess('Operace úspěšná!');
        }, 1000);
      });
    }, 500);
  };

  return (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-secondary-800 mb-4">
        📚 Toast Usage Examples
      </Text>

      <View className="gap-3">
        <Button
          title="🎯 Complete Study Session"
          onPress={handleStudyComplete}
          variant="primary"
          size="md"
          className="w-full"
        />

        <Button
          title="🎭 Process Magic Notes"
          onPress={handleMagicNotes}
          variant="secondary"
          size="md"
          className="w-full"
        />

        <Button
          title="☁️ Sync Data"
          onPress={handleSync}
          variant="outline"
          size="md"
          className="w-full"
        />

        <Button
          title="📡 Simulate Network Error"
          onPress={handleNetworkOperation}
          variant="outline"
          size="md"
          className="w-full"
        />
      </View>

      {/* Usage Instructions */}
      <View className="bg-green-50 p-4 rounded-lg border border-green-200 mt-6">
        <Text className="text-lg font-semibold text-green-700 mb-2">
          💡 Usage Tips
        </Text>
        <Text className="text-sm text-green-600 leading-5">
          • Use toasts pro immediate feedback po user actions{'\n'}• Combine s
          push notifications pro complete UX{'\n'}• Success toasts pro positive
          reinforcement{'\n'}• Error toasts s retry actions pro better UX{'\n'}•
          Info toasts pro status updates během operací{'\n'}• Achievement toasts
          pro gamification
        </Text>
      </View>
    </View>
  );
}
