import { Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function EspaciosLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].tint },
        headerTintColor: '#FFFFFF',
      }}>
      <Stack.Screen name="index" options={{ title: 'Espacios' }} />
    </Stack>
  );
}