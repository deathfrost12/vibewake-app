import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Přihlášení',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Registrace',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Zapomenuté heslo',
        }}
      />
    </Stack>
  );
}
