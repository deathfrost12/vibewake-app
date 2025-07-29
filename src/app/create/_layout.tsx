import { Stack } from 'expo-router';

export default function CreateLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Vytvořit sadu',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#14C46D',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack>
  );
}
