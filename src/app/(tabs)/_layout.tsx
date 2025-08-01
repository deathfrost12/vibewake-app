import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAlarmStore } from '../../stores/alarm-store';
import { notificationService } from '../../services/notifications/notification-service';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';

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

// Clean FAB button for center tab
function CreateButton() {
  return (
    <View
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: APP_COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Ionicons name="add" size={32} color="#FFFFFF" />
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const { loadAlarms } = useAlarmStore();
  const { isDark } = useTheme();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  useEffect(() => {
    // Initialize alarm store when app loads
    loadAlarms();

    // Setup alarm notification listeners
    notificationService.setupAlarmListeners();
  }, [loadAlarms]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: APP_COLORS.primary,
        tabBarInactiveTintColor: theme.text.secondary,
        tabBarStyle: {
          backgroundColor: isDark
            ? 'rgba(13, 26, 26, 0.9)'
            : 'rgba(248, 250, 252, 0.9)',
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)',
          height: 88,
          paddingTop: 8,
          paddingBottom: 34,
          position: 'absolute',
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
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -12,
                }}
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
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
