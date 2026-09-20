import { Stack } from 'expo-router';

export default function CuentaLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Cuenta' }} />
    </Stack>
  );
}