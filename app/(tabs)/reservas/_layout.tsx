import { Stack } from 'expo-router';

export default function ReservasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mis reservas' }} />
    </Stack>
  );
}