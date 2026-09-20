import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useHeader() {
  const colorScheme = useColorScheme();

  return {
    headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].tint },
    headerTintColor: '#FFFFFF',
  };
}