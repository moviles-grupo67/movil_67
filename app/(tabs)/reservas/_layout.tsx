import { Stack } from 'expo-router';
import { useHeader } from '@/components/useHeader';


export default function ReservasLayout() {
  const header = useHeader();
  
  return (
    <Stack screenOptions={header}>
      <Stack.Screen name="index" options={{ title: 'Mis reservas' }} />
      <Stack.Screen name="[id]" options={{ title: 'Mi reserva' }} />
    </Stack>
  );
}