import { Stack } from 'expo-router';

export default function DevLayout() {
  return (
    <Stack>
      <Stack.Screen name="ui-testing" options={{ headerShown: false }} />
      <Stack.Screen name="revenuecat" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="analytics" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="loading" options={{ headerShown: false }} />
      <Stack.Screen name="system" options={{ headerShown: false }} />
    </Stack>
  );
}
