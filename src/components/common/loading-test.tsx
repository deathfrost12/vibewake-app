import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../ui/button';
import {
  Skeleton,
  StudyCardSkeleton,
  StatsCardSkeleton,
  AchievementSkeleton,
  StudySessionSkeleton,
  DashboardSkeleton,
  LibrarySkeleton,
  CzechSubjectsSkeleton,
} from '../ui/loading-skeleton';
import {
  MagicNotesProcessingSkeleton,
  SyncLoadingState,
  DataLoadingState,
  SearchLoadingState,
  ProfileLoadingState,
  FullScreenLoading,
} from '../ui/loading-states';

/**
 * 🦴 Loading Skeletons & States Test Panel
 *
 * Comprehensive testing interface for all loading components
 */
export default function LoadingTest() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const showDemo = (demoName: string) => {
    setActiveDemo(demoName);
    // Auto hide after 5 seconds
    setTimeout(() => setActiveDemo(null), 5000);
  };

  // Full screen demos
  const renderFullScreenDemo = () => {
    switch (activeDemo) {
      case 'magic-notes':
        return <MagicNotesProcessingSkeleton />;
      case 'data-loading':
        return (
          <DataLoadingState
            title="Načítám study sets..."
            subtitle="Stahuju nejnovější materiály"
            showProgress={true}
          />
        );
      case 'profile-loading':
        return <ProfileLoadingState />;
      case 'full-screen':
        return <FullScreenLoading />;
      case 'dashboard':
        return <DashboardSkeleton />;
      case 'library':
        return <LibrarySkeleton />;
      case 'study-session':
        return <StudySessionSkeleton />;
      default:
        return null;
    }
  };

  if (
    activeDemo &&
    [
      'magic-notes',
      'data-loading',
      'profile-loading',
      'full-screen',
      'dashboard',
      'library',
      'study-session',
    ].includes(activeDemo)
  ) {
    return (
      <View className="flex-1">
        {renderFullScreenDemo()}

        {/* Exit button */}
        <View className="absolute top-12 right-4">
          <Button
            title="✕"
            onPress={() => setActiveDemo(null)}
            size="sm"
            variant="secondary"
            className="w-10 h-10 rounded-full"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-secondary-800 mb-4">
        🦴 Loading Skeletons & States Test
      </Text>

      <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
        {/* Basic Skeleton Components */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            🦴 Basic Skeletons
          </Text>

          <View className="bg-white rounded-lg p-4 mb-3">
            <Text className="text-sm text-gray-600 mb-2">Base Skeleton:</Text>
            <Skeleton
              width="80%"
              height={20}
              borderRadius={4}
              className="mb-2"
            />
            <Skeleton
              width="60%"
              height={16}
              borderRadius={4}
              className="mb-2"
            />
            <Skeleton width="90%" height={14} borderRadius={4} />
          </View>

          <View className="bg-white rounded-lg p-4 mb-3">
            <Text className="text-sm text-gray-600 mb-2">Czech Subjects:</Text>
            <View className="max-h-40">
              <CzechSubjectsSkeleton />
            </View>
          </View>
        </View>

        {/* Card Skeletons */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            📚 Card Skeletons
          </Text>

          <View className="gap-2">
            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-sm text-gray-600 mb-2">Study Card:</Text>
              <StudyCardSkeleton />
            </View>

            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-sm text-gray-600 mb-2">Stats Card:</Text>
              <StatsCardSkeleton />
            </View>

            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-sm text-gray-600 mb-2">Achievement:</Text>
              <AchievementSkeleton />
            </View>
          </View>
        </View>

        {/* Loading States */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            ⏳ Loading States
          </Text>

          <View className="gap-2">
            <View className="bg-white rounded-lg p-4">
              <Text className="text-sm text-gray-600 mb-2">Sync Loading:</Text>
              <SyncLoadingState message="Synchronizuji flashcards..." />
            </View>

            <View className="bg-white rounded-lg p-4">
              <Text className="text-sm text-gray-600 mb-2">
                Search Loading:
              </Text>
              <SearchLoadingState query="český jazyk" />
            </View>
          </View>
        </View>

        {/* Full Screen Demos */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            📱 Full Screen Demos
          </Text>

          <View className="gap-2">
            <Button
              title="🎭 Magic Notes Processing"
              onPress={() => showDemo('magic-notes')}
              size="sm"
              variant="primary"
              className="w-full"
            />

            <Button
              title="📊 Data Loading (with Progress)"
              onPress={() => showDemo('data-loading')}
              size="sm"
              variant="primary"
              className="w-full"
            />

            <Button
              title="📱 Profile Loading"
              onPress={() => showDemo('profile-loading')}
              size="sm"
              variant="secondary"
              className="w-full"
            />

            <Button
              title="🎨 Full Screen Loading"
              onPress={() => showDemo('full-screen')}
              size="sm"
              variant="secondary"
              className="w-full"
            />
          </View>
        </View>

        {/* Screen Skeletons */}
        <View className="mb-6">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            🏠 Screen Skeletons
          </Text>

          <View className="gap-2">
            <Button
              title="🏠 Dashboard Skeleton"
              onPress={() => showDemo('dashboard')}
              size="sm"
              variant="outline"
              className="w-full"
            />

            <Button
              title="📚 Library Skeleton"
              onPress={() => showDemo('library')}
              size="sm"
              variant="outline"
              className="w-full"
            />

            <Button
              title="📝 Study Session Skeleton"
              onPress={() => showDemo('study-session')}
              size="sm"
              variant="outline"
              className="w-full"
            />
          </View>
        </View>

        {/* Loading Performance Tips */}
        <View className="mb-4">
          <Text className="text-base font-medium text-secondary-700 mb-3">
            ⚡ Performance Features
          </Text>

          <View className="bg-green-50 p-4 rounded-lg border border-green-200">
            <Text className="text-sm text-green-700 mb-2 font-medium">
              ✅ Czech Educational Context
            </Text>
            <Text className="text-xs text-green-600 mb-3">
              • Maturita-specific loading messages{'\n'}• Subject-aware
              skeletons (Český jazyk, Matematika){'\n'}• Czech motivational tips
            </Text>

            <Text className="text-sm text-green-700 mb-2 font-medium">
              🎨 Magical Green Animations
            </Text>
            <Text className="text-xs text-green-600 mb-3">
              • Smooth 60fps skeleton shimmer{'\n'}• Magical Green progress
              indicators{'\n'}• Native driver animations
            </Text>

            <Text className="text-sm text-green-700 mb-2 font-medium">
              📱 Production Ready
            </Text>
            <Text className="text-xs text-green-600">
              • Memory efficient animations{'\n'}• Auto-cleanup timers{'\n'}•
              Responsive skeleton layouts
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Instructions */}
      <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
        <Text className="text-lg font-semibold text-blue-700 mb-2">
          📋 Loading Instructions
        </Text>
        <Text className="text-sm text-blue-600 leading-5">
          • Základní skeletons pro různé komponenty{'\n'}• Full screen demos s
          authentic UX{'\n'}• Magic Notes processing simulation{'\n'}• Czech
          educational loading messages{'\n'}• Smooth animations s Magical Green
          {'\n'}• Auto-dismiss po 5 sekundách
        </Text>
      </View>
    </View>
  );
}
