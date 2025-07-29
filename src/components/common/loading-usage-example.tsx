import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../ui/button';
import {
  useLoading,
  useMagicNotesLoading,
  useSearchLoading,
  useCzechDataLoading,
} from '../../hooks/use-loading';
import {
  MagicNotesProcessingSkeleton,
  SyncLoadingState,
  DataLoadingState,
  SearchLoadingState,
} from '../ui/loading-states';
import { StudyCardSkeleton } from '../ui/loading-skeleton';

/**
 * 📚 Loading Hooks Usage Examples
 *
 * Demonstrates how to use loading hooks in real components
 */
export default function LoadingUsageExample() {
  const basicLoading = useLoading();
  const magicNotes = useMagicNotesLoading();
  const search = useSearchLoading();
  const czechData = useCzechDataLoading();

  // Example API functions
  const simulateStudySetLoad = async () => {
    console.log('🚀 Loading study sets...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return ['Český jazyk - Maturita', 'Matematika - Funkce'];
  };

  const simulateSearch = async (query: string) => {
    console.log(`🔍 Searching for: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { id: 1, title: `${query} - výsledek 1` },
      { id: 2, title: `${query} - výsledek 2` },
    ];
  };

  return (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-secondary-800 mb-4">
        🔄 Loading Hooks Usage Examples
      </Text>

      {/* Basic Loading Hook */}
      <View className="mb-6">
        <Text className="text-base font-medium text-secondary-700 mb-3">
          🔄 Basic Loading Hook
        </Text>

        <View className="bg-white rounded-lg p-4 border border-gray-200">
          <Text className="text-sm text-gray-600 mb-3">
            Status: {basicLoading.loadingState} | Loading:{' '}
            {basicLoading.isLoading ? 'ANO' : 'NE'}
          </Text>

          {basicLoading.error && (
            <Text className="text-red-600 text-sm mb-3">
              Error: {basicLoading.error}
            </Text>
          )}

          {basicLoading.isLoading && (
            <SyncLoadingState message="Zpracovávám data..." />
          )}

          <View className="flex-row gap-2">
            <Button
              title="📚 Load Study Sets"
              onPress={() => basicLoading.withLoading(simulateStudySetLoad)}
              size="sm"
              variant="primary"
              disabled={basicLoading.isLoading}
            />
            <Button
              title="❌ Simulate Error"
              onPress={() => basicLoading.setError('Test error message')}
              size="sm"
              variant="secondary"
            />
            <Button
              title="🔄 Reset"
              onPress={() => basicLoading.setIdle()}
              size="sm"
              variant="outline"
            />
          </View>
        </View>
      </View>

      {/* Magic Notes Loading */}
      <View className="mb-6">
        <Text className="text-base font-medium text-secondary-700 mb-3">
          🎭 Magic Notes Loading Hook
        </Text>

        <View className="bg-white rounded-lg p-4 border border-gray-200">
          <Text className="text-sm text-gray-600 mb-3">
            Stage: {magicNotes.stage} | Progress: {magicNotes.progress}% |
            Processing: {magicNotes.isProcessing ? 'ANO' : 'NE'}
          </Text>

          {magicNotes.error && (
            <Text className="text-red-600 text-sm mb-3">
              Error: {magicNotes.error}
            </Text>
          )}

          {magicNotes.isProcessing && (
            <View className="mb-4">
              {magicNotes.stage === 'ocr' && (
                <Text className="text-blue-600 text-center">
                  🔍 OCR rozpoznávání...
                </Text>
              )}
              {magicNotes.stage === 'ai' && (
                <Text className="text-purple-600 text-center">
                  🤖 AI zpracování...
                </Text>
              )}
              {magicNotes.stage === 'creating' && (
                <Text className="text-green-600 text-center">
                  ✨ Vytváření karet...
                </Text>
              )}

              <View className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <View
                  style={{ width: `${magicNotes.progress}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </View>
            </View>
          )}

          <View className="flex-row gap-2">
            <Button
              title="🎭 Start Magic Notes"
              onPress={() => magicNotes.startProcessing('fake-image-uri')}
              size="sm"
              variant="primary"
              disabled={magicNotes.isProcessing}
            />
            <Button
              title="🔄 Reset"
              onPress={() => magicNotes.reset()}
              size="sm"
              variant="outline"
            />
          </View>
        </View>
      </View>

      {/* Search Loading */}
      <View className="mb-6">
        <Text className="text-base font-medium text-secondary-700 mb-3">
          🔍 Search Loading Hook
        </Text>

        <View className="bg-white rounded-lg p-4 border border-gray-200">
          <Text className="text-sm text-gray-600 mb-3">
            Query: "{search.query}" | Searching:{' '}
            {search.isSearching ? 'ANO' : 'NE'} | Results:{' '}
            {search.results.length}
          </Text>

          {search.isSearching && <SearchLoadingState query={search.query} />}

          {search.results.length > 0 && !search.isSearching && (
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Výsledky:
              </Text>
              {search.results.map((result, index) => (
                <Text key={index} className="text-sm text-gray-600">
                  • {result.title}
                </Text>
              ))}
            </View>
          )}

          <View className="flex-row gap-2">
            <Button
              title="🔍 Search 'český jazyk'"
              onPress={() => search.search('český jazyk', simulateSearch)}
              size="sm"
              variant="primary"
              disabled={search.isSearching}
            />
            <Button
              title="🔍 Search 'matematika'"
              onPress={() => search.search('matematika', simulateSearch)}
              size="sm"
              variant="secondary"
              disabled={search.isSearching}
            />
            <Button
              title="🧹 Clear"
              onPress={() => search.clearSearch()}
              size="sm"
              variant="outline"
            />
          </View>
        </View>
      </View>

      {/* Czech Data Loading */}
      <View className="mb-6">
        <Text className="text-base font-medium text-secondary-700 mb-3">
          📊 Czech Data Loading Hook
        </Text>

        <View className="bg-white rounded-lg p-4 border border-gray-200">
          <Text className="text-sm text-gray-600 mb-3">
            State: {czechData.loadingState} | Loading:{' '}
            {czechData.isLoading ? 'ANO' : 'NE'}
          </Text>

          {czechData.error && (
            <Text className="text-red-600 text-sm mb-3">
              Error: {czechData.error}
            </Text>
          )}

          {czechData.isLoading && (
            <View className="mb-4">
              {czechData.loadingState === 'loading' && <StudyCardSkeleton />}
              {czechData.loadingState === 'syncing' && (
                <SyncLoadingState message="Synchronizuji česká data..." />
              )}
            </View>
          )}

          <View className="flex-row gap-2 flex-wrap">
            <Button
              title="📚 Load Study Sets"
              onPress={() => czechData.loadStudySets()}
              size="sm"
              variant="primary"
              disabled={czechData.isLoading}
            />
            <Button
              title="☁️ Sync Data"
              onPress={() => czechData.syncUserData()}
              size="sm"
              variant="secondary"
              disabled={czechData.isLoading}
            />
            <Button
              title="👤 Load Profile"
              onPress={() => czechData.loadUserProfile()}
              size="sm"
              variant="outline"
              disabled={czechData.isLoading}
            />
          </View>
        </View>
      </View>

      {/* Usage Tips */}
      <View className="bg-green-50 p-4 rounded-lg border border-green-200">
        <Text className="text-lg font-semibold text-green-700 mb-2">
          💡 Loading Hooks Tips
        </Text>
        <Text className="text-sm text-green-600 leading-5">
          • **useLoading** - univerzální loading state management{'\n'}•
          **useMagicNotesLoading** - specialized pro OCR + AI processing{'\n'}•
          **useSearchLoading** - debounced search s loading states{'\n'}•
          **useCzechDataLoading** - educational context loading{'\n'}•
          **withLoading** - auto error handling wrapper{'\n'}• **Combine s
          skeletons** - smooth loading experience
        </Text>
      </View>
    </View>
  );
}
