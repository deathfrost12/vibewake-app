import React from 'react';
import { View, Text } from 'react-native';
import { ThemedView, ThemedText } from '../../components/ui/themed-view';

// Placeholder tab screen - actual create button navigates to /alarms/create
export default function CreateTabScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{ fontSize: 18, opacity: 0.7 }}>
        Use the + button to create an alarm
      </ThemedText>
    </ThemedView>
  );
}
