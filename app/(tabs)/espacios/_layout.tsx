import { Stack } from 'expo-router';

export default function EspaciosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Espacios' }} />
    </Stack>
  );
}