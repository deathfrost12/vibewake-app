import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAlarmStore } from '../../stores/alarm-store';
import { notificationService } from '../../services/notifications/notification-service';

// Tab bar icon component
function TabBarIcon({
  name,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return <Ionicons name={name} size={24} color={color} />;
}

// Neon FAB button for center tab
function CreateButton() {
  return (
    <View className="w-16 h-16 rounded-full bg-gradient-cta items-center justify-center shadow-fab animate-glow-pulse border-2 border-neon-primary">
      <Ionicons name="add" size={32} color="#FFFFFF" />
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const { loadAlarms } = useAlarmStore();

  useEffect(() => {
    // Initialize alarm store when app loads
    loadAlarms();
    
    // Setup alarm notification listeners
    notificationService.setupAlarmListeners();
  }, [loadAlarms]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5CFFF0',      // Neon primary
        tabBarInactiveTintColor: '#A8B4B6',   // Cool secondary
        tabBarStyle: {
          backgroundColor: 'rgba(13, 26, 26, 0.9)', // Glass background
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.07)', // Subtle border
          height: 88,
          paddingTop: 8,
          paddingBottom: 34,
          position: 'absolute',
          backdropFilter: 'blur(8px)',     // Glassmorphism blur
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Alarms',
          tabBarIcon: ({ color }) => <TabBarIcon name="alarm" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => <CreateButton />,
          tabBarButton: ({ children, ...props }) => {
            // Filter out problematic props that cause TypeScript errors
            const { delayLongPress, ...safeProps } = props as any;
            return (
              <TouchableOpacity
                {...safeProps}
                className="flex-1 justify-center items-center -mt-3"
                activeOpacity={0.7}
                onPress={() => router.push('/alarms/create')}
              >
                <CreateButton />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
