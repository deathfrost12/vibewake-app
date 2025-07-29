import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '../../theme/useThemedStyles';

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

// Create button for center tab
function CreateButton() {
  const { colors, shadows } = useThemedStyles();

  return (
    <TouchableOpacity
      style={{
        width: 56,
        height: 56,
        backgroundColor: colors.interactive.accent,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
      }}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { colors } = useThemedStyles();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 88,
          paddingTop: 8,
          paddingBottom: 34,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Testing',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="flask" color={color} />
          ),
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
                className="flex-1 justify-center items-center"
              >
                <CreateButton />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="analytics" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
