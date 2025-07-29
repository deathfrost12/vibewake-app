import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './button';
import { Skeleton } from './loading-skeleton';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
}

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * 🔄 Loading State Component - Czech educational context
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Načítám...',
  size = 'large',
  color = '#14C46D', // Magical Green
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <ActivityIndicator size={size} color={color} className="mb-4" />
      <Text className="text-lg text-secondary-600 text-center font-medium">
        {message}
      </Text>
    </View>
  );
};

/**
 * ❌ Error State Component - Czech UX with retry
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Něco se pokazilo',
  message = 'Nepodařilo se načíst data. Zkus to prosím znovu.',
  onRetry,
  retryLabel = 'Zkusit znovu',
  showIcon = true,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      {showIcon && (
        <View className="mb-6">
          <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
        </View>
      )}

      <Text className="text-xl font-semibold text-secondary-800 text-center mb-3">
        {title}
      </Text>

      <Text className="text-base text-secondary-600 text-center mb-6 leading-6">
        {message}
      </Text>

      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          size="md"
        />
      )}
    </View>
  );
};

/**
 * 📭 Empty State Component - Czech educational context
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'library-outline',
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <View className="mb-6">
        <Ionicons name={icon as any} size={80} color="#9CA3AF" />
      </View>

      <Text className="text-xl font-semibold text-secondary-800 text-center mb-3">
        {title}
      </Text>

      <Text className="text-base text-secondary-600 text-center mb-6 leading-6">
        {message}
      </Text>

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
        />
      )}
    </View>
  );
};

/**
 * 🔍 Search Empty State - specialized for study content
 */
export const SearchEmptyState: React.FC<{
  query: string;
  onClear?: () => void;
}> = ({ query, onClear }) => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <View className="mb-6">
        <Ionicons name="search-outline" size={64} color="#9CA3AF" />
      </View>

      <Text className="text-xl font-semibold text-secondary-800 text-center mb-3">
        Žádné výsledky
      </Text>

      <Text className="text-base text-secondary-600 text-center mb-6 leading-6">
        Pro hledání "{query}" jsme nenašli žádné studijní sady.
      </Text>

      {onClear && (
        <TouchableOpacity
          onPress={onClear}
          className="bg-gray-100 rounded-lg px-4 py-2"
        >
          <Text className="text-secondary-700 font-medium">
            Vymazat hledání
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * 📚 Study Content Loading States - specific to Czech education
 */
export const StudyContentLoading: React.FC = () => {
  return (
    <LoadingState message="Připravuji studijní materiály..." size="large" />
  );
};

export const StudySessionLoading: React.FC = () => {
  return <LoadingState message="Spouštím studijní session..." size="large" />;
};

export const MagicNotesLoading: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <ActivityIndicator size="large" color="#14C46D" className="mb-4" />
      <Text className="text-lg text-secondary-600 text-center font-medium mb-2">
        🎭 Magic Notes pracuje...
      </Text>
      <Text className="text-sm text-secondary-500 text-center">
        Převádím tvé poznámky na studijní karty
      </Text>
    </View>
  );
};

/**
 * 🌐 Network Error States - Czech localized
 */
export const NetworkErrorState: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => {
  return (
    <ErrorState
      title="Problém s připojením"
      message="Zkontroluj internetové připojení a zkus to znovu."
      onRetry={onRetry}
      retryLabel="Zkusit znovu"
    />
  );
};

export const ServerErrorState: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => {
  return (
    <ErrorState
      title="Chyba serveru"
      message="Momentálně máme technické problémy. Zkus to prosím za chvilku."
      onRetry={onRetry}
      retryLabel="Zkusit znovu"
    />
  );
};

/**
 * 📈 Data Empty States - for different sections
 */
export const EmptyLibraryState: React.FC<{ onCreateFirst?: () => void }> = ({
  onCreateFirst,
}) => {
  return (
    <EmptyState
      title="Zatím žádné studijní sady"
      message="Vytvoř si první studijní sadu a začni se připravovat na maturitu!"
      icon="library-outline"
      actionLabel="Vytvořit první sadu"
      onAction={onCreateFirst}
    />
  );
};

export const EmptyStatsState: React.FC = () => {
  return (
    <EmptyState
      title="Žádné statistiky"
      message="Začni studovat a sleduj svůj pokrok v přípravě na maturitu."
      icon="bar-chart-outline"
    />
  );
};

export const EmptyAchievementsState: React.FC = () => {
  return (
    <EmptyState
      title="Zatím žádné úspěchy"
      message="Studuj pravidelně a odemykej nové achievementy!"
      icon="trophy-outline"
    />
  );
};

/**
 * 🎯 Specific Loading Messages for Czech Educational Content
 */
export const CzechEducationLoadingMessages = {
  // Subject loading
  loadingCeskyJazyk: 'Načítám český jazyk...',
  loadingMatematika: 'Načítám matematiku...',
  loadingAnglictina: 'Načítám angličtinu...',
  loadingDejepis: 'Načítám dějepis...',

  // Exam preparation
  loadingMaturita: 'Připravuji materiály k maturitě...',
  loadingPrijimacky: 'Načítám příjímačky...',
  loadingZapocet: 'Načítám zápočty...',

  // Study sessions
  startingStudy: 'Spouštím studium...',
  preparingCards: 'Připravuji flashcards...',
  calculatingProgress: 'Počítám pokrok...',

  // AI features
  aiProcessing: 'AI zpracovává...',
  magicNotesWorking: 'Magic Notes pracuje...',
  ocrProcessing: 'Rozpoznávám text...',
};

/**
 * 🎨 Loading with Progress - for longer operations
 */
interface ProgressLoadingProps {
  progress: number; // 0-100
  message: string;
  subMessage?: string;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress,
  message,
  subMessage,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <ActivityIndicator size="large" color="#14C46D" className="mb-6" />

      <Text className="text-lg text-secondary-600 text-center font-medium mb-4">
        {message}
      </Text>

      {/* Progress Bar */}
      <View className="w-full max-w-xs mb-3">
        <View className="bg-gray-200 rounded-full h-2">
          <View
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <Text className="text-sm text-secondary-500 text-center">
        {progress}% dokončeno
      </Text>

      {subMessage && (
        <Text className="text-xs text-secondary-400 text-center mt-2">
          {subMessage}
        </Text>
      )}
    </View>
  );
};

/**
 * 🎭 Magic Notes Processing Skeleton
 * Pro OCR + AI zpracování s Czech educational context
 */
export const MagicNotesProcessingSkeleton: React.FC = () => {
  const [stage, setStage] = useState<'ocr' | 'ai' | 'creating'>('ocr');
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate processing stages
    const timer1 = setTimeout(() => setStage('ai'), 2000);
    const timer2 = setTimeout(() => setStage('creating'), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const getStageInfo = () => {
    switch (stage) {
      case 'ocr':
        return {
          icon: 'scan' as const,
          title: '🔍 Rozpoznávám text...',
          subtitle: 'Analyzuji tvé poznámky pomocí OCR',
          color: '#3B82F6',
        };
      case 'ai':
        return {
          icon: 'bulb' as const,
          title: '🤖 Zpracovávám obsah...',
          subtitle: 'AI vytváří flashcards z poznámek',
          color: '#8B5CF6',
        };
      case 'creating':
        return {
          icon: 'create' as const,
          title: '✨ Dokončuji Magic Notes...',
          subtitle: 'Vytvářím finální study set',
          color: '#14C46D',
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <View className="flex-1 justify-center items-center p-6 bg-gray-50">
      {/* Magic animation */}
      <Animated.View style={{ transform: [{ scale }] }} className="mb-6">
        <View
          style={{ backgroundColor: stageInfo.color }}
          className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name={stageInfo.icon} size={40} color="white" />
        </View>
      </Animated.View>

      {/* Status text */}
      <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
        {stageInfo.title}
      </Text>
      <Text className="text-base text-gray-600 text-center mb-8">
        {stageInfo.subtitle}
      </Text>

      {/* Processing steps */}
      <View className="w-full max-w-sm">
        <View className="flex-row items-center mb-4">
          <View
            className={`w-3 h-3 rounded-full mr-3 ${stage === 'ocr' ? 'bg-blue-500' : 'bg-green-500'}`}
          />
          <Text
            className={`flex-1 ${stage === 'ocr' ? 'text-blue-600 font-medium' : 'text-green-600'}`}
          >
            Rozpoznání textu z obrázku
          </Text>
          {stage !== 'ocr' && (
            <Ionicons name="checkmark" size={16} color="#10B981" />
          )}
        </View>

        <View className="flex-row items-center mb-4">
          <View
            className={`w-3 h-3 rounded-full mr-3 ${
              stage === 'ocr'
                ? 'bg-gray-300'
                : stage === 'ai'
                  ? 'bg-purple-500'
                  : 'bg-green-500'
            }`}
          />
          <Text
            className={`flex-1 ${
              stage === 'ocr'
                ? 'text-gray-400'
                : stage === 'ai'
                  ? 'text-purple-600 font-medium'
                  : 'text-green-600'
            }`}
          >
            AI analýza obsahu
          </Text>
          {stage === 'creating' && (
            <Ionicons name="checkmark" size={16} color="#10B981" />
          )}
        </View>

        <View className="flex-row items-center">
          <View
            className={`w-3 h-3 rounded-full mr-3 ${
              stage === 'creating' ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          <Text
            className={`flex-1 ${
              stage === 'creating'
                ? 'text-green-600 font-medium'
                : 'text-gray-400'
            }`}
          >
            Vytváření flashcards
          </Text>
        </View>
      </View>

      {/* Card preview skeletons */}
      <View className="w-full mt-8">
        <Text className="text-sm text-gray-500 mb-3 text-center">
          Náhled vytvářených karet:
        </Text>

        <View className="space-y-3">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Skeleton
              width="80%"
              height={16}
              borderRadius={4}
              className="mb-2"
            />
            <Skeleton
              width="100%"
              height={14}
              borderRadius={4}
              className="mb-1"
            />
            <Skeleton width="60%" height={14} borderRadius={4} />
          </View>

          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Skeleton
              width="70%"
              height={16}
              borderRadius={4}
              className="mb-2"
            />
            <Skeleton
              width="90%"
              height={14}
              borderRadius={4}
              className="mb-1"
            />
            <Skeleton width="80%" height={14} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * ☁️ Sync Loading State
 * Pro synchronizaci s Supabase
 */
export const SyncLoadingState: React.FC<{ message?: string }> = ({
  message = 'Synchronizuji data...',
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-row items-center justify-center p-4">
      <Animated.View style={{ transform: [{ rotate }] }} className="mr-3">
        <Ionicons name="sync" size={20} color="#14C46D" />
      </Animated.View>
      <Text className="text-base text-gray-600">{message}</Text>
    </View>
  );
};

/**
 * 📊 Data Loading State
 * Pro obecné načítání dat s progress indicator
 */
export const DataLoadingState: React.FC<{
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
}> = ({
  title = 'Načítám data...',
  subtitle = 'Prosím čekej',
  showProgress = false,
}) => {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Simulate progress if enabled
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [showProgress]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-1 justify-center items-center p-6 bg-gray-50"
    >
      {/* Loading icon */}
      <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
        <Ionicons name="hourglass" size={32} color="#14C46D" />
      </View>

      {/* Text */}
      <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-base text-gray-600 text-center mb-4">
        {subtitle}
      </Text>

      {/* Progress bar */}
      {showProgress && (
        <View className="w-full max-w-xs">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500">Pokrok</Text>
            <Text className="text-sm text-gray-500">
              {Math.round(progress)}%
            </Text>
          </View>
          <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              style={{ width: `${progress}%` }}
              className="h-full bg-primary rounded-full"
            />
          </View>
        </View>
      )}
    </Animated.View>
  );
};

/**
 * 🔍 Search Loading State
 * Pro loading během search operations
 */
export const SearchLoadingState: React.FC<{ query?: string }> = ({ query }) => {
  const dots = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animateDots = () => {
      const animations = dots.map((dot, index) =>
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.loop(Animated.stagger(100, animations)).start();
    };

    animateDots();
  }, []);

  return (
    <View className="flex-row items-center justify-center p-6">
      <Ionicons name="search" size={20} color="#14C46D" className="mr-2" />
      <Text className="text-base text-gray-600 mr-2">
        {query ? `Hledám "${query}"` : 'Vyhledávám'}
      </Text>
      <View className="flex-row">
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: dot,
              transform: [
                {
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                },
              ],
            }}
            className="w-1 h-1 bg-primary rounded-full mx-0.5"
          />
        ))}
      </View>
    </View>
  );
};

/**
 * 📱 Profile Loading State
 * Pro loading user profile
 */
export const ProfileLoadingState: React.FC = () => {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Header */}
      <View className="items-center mb-6">
        <Skeleton width={120} height={120} borderRadius={60} className="mb-4" />
        <Skeleton width="60%" height={24} borderRadius={4} className="mb-2" />
        <Skeleton width="40%" height={16} borderRadius={4} />
      </View>

      {/* Stats cards */}
      <View className="flex-row mb-6 space-x-3">
        <View className="flex-1 bg-white rounded-xl p-4">
          <Skeleton
            width="100%"
            height={16}
            borderRadius={4}
            className="mb-2"
          />
          <Skeleton width="60%" height={20} borderRadius={4} />
        </View>
        <View className="flex-1 bg-white rounded-xl p-4">
          <Skeleton
            width="100%"
            height={16}
            borderRadius={4}
            className="mb-2"
          />
          <Skeleton width="60%" height={20} borderRadius={4} />
        </View>
      </View>

      {/* Menu items */}
      <View className="space-y-3">
        {[1, 2, 3, 4, 5].map(item => (
          <View
            key={item}
            className="bg-white rounded-lg p-4 flex-row items-center"
          >
            <Skeleton
              width={24}
              height={24}
              borderRadius={12}
              className="mr-3"
            />
            <View className="flex-1">
              <Skeleton
                width="70%"
                height={16}
                borderRadius={4}
                className="mb-1"
              />
              <Skeleton width="50%" height={14} borderRadius={4} />
            </View>
            <Skeleton width={20} height={20} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * 🎨 Full Screen Loading with Czech motivation
 */
export const FullScreenLoading: React.FC<{
  title?: string;
  subtitle?: string;
  showTips?: boolean;
}> = ({
  title = 'Repetito se načítá...',
  subtitle = 'Připravuji tvé studijní materiály',
  showTips = true,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const czechTips = [
    '💡 Tip: Pravidelné opakování je klíč k úspěchu',
    '🎯 Tip: Studuj každý den alespoň 15 minut',
    '🔥 Tip: Udržuj svou studijní šňůru!',
    '📚 Tip: Používej Magic Notes pro rychlé učení',
    '🏆 Tip: Oslavuj každý malý pokrok',
  ];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Rotate tips
    if (showTips) {
      const interval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % czechTips.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [showTips]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-1 justify-center items-center bg-white px-6"
    >
      {/* Logo area */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4">
          <Text className="text-white text-2xl font-bold">R</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-2">{title}</Text>
        <Text className="text-base text-gray-600 text-center">{subtitle}</Text>
      </View>

      {/* Loading indicator */}
      <View className="mb-8">
        <SyncLoadingState message="" />
      </View>

      {/* Czech tips */}
      {showTips && (
        <View className="bg-green-50 rounded-lg p-4 border border-green-200">
          <Text className="text-green-700 text-center font-medium">
            {czechTips[tipIndex]}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default {
  LoadingState,
  ErrorState,
  EmptyState,
  SearchEmptyState,
  StudyContentLoading,
  StudySessionLoading,
  MagicNotesLoading,
  NetworkErrorState,
  ServerErrorState,
  EmptyLibraryState,
  EmptyStatsState,
  EmptyAchievementsState,
  ProgressLoading,
  CzechEducationLoadingMessages,
  MagicNotesProcessingSkeleton,
  SyncLoadingState,
  DataLoadingState,
  SearchLoadingState,
  ProfileLoadingState,
  FullScreenLoading,
};
