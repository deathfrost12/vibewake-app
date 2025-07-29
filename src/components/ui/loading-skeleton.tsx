import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

/**
 * 💀 Base Skeleton Component with Magical Green shimmer
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  className = '',
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={{
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
        borderRadius,
      }}
      className={`bg-gray-200 ${className}`}
    >
      <Animated.View
        style={{
          flex: 1,
          borderRadius,
          opacity,
        }}
        className="bg-primary/20"
      />
    </View>
  );
};

/**
 * 📚 Study Card Skeleton - pro loading study sets
 */
export const StudyCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Skeleton width="60%" height={20} borderRadius={4} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>

      {/* Subject and difficulty */}
      <View className="flex-row items-center mb-3 space-x-2">
        <Skeleton width="40%" height={16} borderRadius={8} />
        <Skeleton width="30%" height={16} borderRadius={8} />
      </View>

      {/* Description */}
      <View className="mb-3">
        <Skeleton width="100%" height={14} borderRadius={4} className="mb-1" />
        <Skeleton width="80%" height={14} borderRadius={4} />
      </View>

      {/* Progress bar */}
      <View className="mb-3">
        <View className="flex-row justify-between items-center mb-1">
          <Skeleton width="30%" height={12} borderRadius={4} />
          <Skeleton width="20%" height={12} borderRadius={4} />
        </View>
        <Skeleton width="100%" height={6} borderRadius={3} />
      </View>

      {/* Action buttons */}
      <View className="flex-row space-x-2">
        <Skeleton width="48%" height={36} borderRadius={8} />
        <Skeleton width="48%" height={36} borderRadius={8} />
      </View>
    </View>
  );
};

/**
 * 📊 Stats Card Skeleton - pro loading statistics
 */
export const StatsCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Title */}
      <Skeleton width="50%" height={18} borderRadius={4} className="mb-3" />

      {/* Main stat */}
      <View className="items-center mb-4">
        <Skeleton width={80} height={80} borderRadius={40} className="mb-2" />
        <Skeleton width="60%" height={24} borderRadius={4} className="mb-1" />
        <Skeleton width="40%" height={14} borderRadius={4} />
      </View>

      {/* Sub stats */}
      <View className="flex-row justify-between">
        <View className="items-center">
          <Skeleton width={40} height={40} borderRadius={20} className="mb-1" />
          <Skeleton width="80%" height={12} borderRadius={4} />
        </View>
        <View className="items-center">
          <Skeleton width={40} height={40} borderRadius={20} className="mb-1" />
          <Skeleton width="80%" height={12} borderRadius={4} />
        </View>
        <View className="items-center">
          <Skeleton width={40} height={40} borderRadius={20} className="mb-1" />
          <Skeleton width="80%" height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

/**
 * 🎯 Achievement Skeleton - pro loading achievements
 */
export const AchievementSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center">
        {/* Icon */}
        <Skeleton width={48} height={48} borderRadius={24} className="mr-3" />

        {/* Content */}
        <View className="flex-1">
          <Skeleton width="70%" height={16} borderRadius={4} className="mb-2" />
          <Skeleton width="90%" height={14} borderRadius={4} className="mb-1" />
          <Skeleton width="50%" height={12} borderRadius={4} />
        </View>

        {/* Badge */}
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>
    </View>
  );
};

/**
 * 📝 Study Session Skeleton - pro loading study sessions
 */
export const StudySessionSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <Skeleton width={30} height={30} borderRadius={15} />
          <Skeleton width="40%" height={18} borderRadius={4} />
          <Skeleton width={30} height={30} borderRadius={15} />
        </View>
        <Skeleton width="100%" height={6} borderRadius={3} />
      </View>

      {/* Main card area */}
      <View className="flex-1 p-6 justify-center">
        <View className="bg-gray-50 rounded-2xl p-6 mb-6 min-h-[300px] justify-center">
          <Skeleton
            width="80%"
            height={24}
            borderRadius={4}
            className="mb-4 self-center"
          />
          <Skeleton
            width="100%"
            height={18}
            borderRadius={4}
            className="mb-2"
          />
          <Skeleton width="90%" height={18} borderRadius={4} className="mb-2" />
          <Skeleton width="70%" height={18} borderRadius={4} className="mb-4" />
          <Skeleton
            width="60%"
            height={16}
            borderRadius={4}
            className="self-center"
          />
        </View>

        {/* Action buttons */}
        <View className="flex-row space-x-3">
          <Skeleton width="30%" height={48} borderRadius={24} />
          <Skeleton width="35%" height={48} borderRadius={24} />
          <Skeleton width="30%" height={48} borderRadius={24} />
        </View>
      </View>
    </View>
  );
};

/**
 * 📱 Dashboard Skeleton - kompletní dashboard loading
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Welcome Section */}
      <View className="mb-6">
        <Skeleton width="60%" height={28} borderRadius={4} className="mb-2" />
        <Skeleton width="40%" height={16} borderRadius={4} />
      </View>

      {/* Quick Stats */}
      <View className="flex-row mb-6 space-x-3">
        <View className="flex-1">
          <StatsCardSkeleton />
        </View>
        <View className="flex-1">
          <StatsCardSkeleton />
        </View>
      </View>

      {/* Today's Study */}
      <View className="mb-6">
        <Skeleton width="50%" height={20} borderRadius={4} className="mb-3" />
        <StudyCardSkeleton />
      </View>

      {/* Recent Activity */}
      <View>
        <Skeleton width="50%" height={20} borderRadius={4} className="mb-3" />
        <AchievementSkeleton />
        <AchievementSkeleton />
      </View>
    </View>
  );
};

/**
 * 📚 Library Skeleton - pro loading study sets v library
 */
export const LibrarySkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Search bar */}
      <Skeleton width="100%" height={44} borderRadius={22} className="mb-4" />

      {/* Filter tabs */}
      <View className="flex-row mb-4 space-x-2">
        <Skeleton width="20%" height={32} borderRadius={16} />
        <Skeleton width="25%" height={32} borderRadius={16} />
        <Skeleton width="30%" height={32} borderRadius={16} />
        <Skeleton width="20%" height={32} borderRadius={16} />
      </View>

      {/* Study cards */}
      <StudyCardSkeleton />
      <StudyCardSkeleton />
      <StudyCardSkeleton />
      <StudyCardSkeleton />
    </View>
  );
};

/**
 * 📊 Czech subjects loading skeleton
 */
export const CzechSubjectsSkeleton: React.FC = () => {
  const czechSubjects = [
    'Český jazyk',
    'Matematika',
    'Anglický jazyk',
    'Dějepis',
    'Geografie',
    'Biologie',
  ];

  return (
    <View className="p-4">
      <Skeleton width="60%" height={24} borderRadius={4} className="mb-4" />

      {czechSubjects.map((_, index) => (
        <View
          key={index}
          className="flex-row items-center mb-3 p-3 bg-white rounded-lg"
        >
          <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />
          <View className="flex-1">
            <Skeleton
              width="70%"
              height={16}
              borderRadius={4}
              className="mb-1"
            />
            <Skeleton width="50%" height={14} borderRadius={4} />
          </View>
          <Skeleton width="20%" height={32} borderRadius={16} />
        </View>
      ))}
    </View>
  );
};

export default {
  Skeleton,
  StudyCardSkeleton,
  StatsCardSkeleton,
  AchievementSkeleton,
  StudySessionSkeleton,
  DashboardSkeleton,
  LibrarySkeleton,
  CzechSubjectsSkeleton,
};
