import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface Props {
  nombre: string;
  size?: number;
  colorBorde?: string;
}

function iniciales(nombre: string) {
  const letras = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');
  return letras || '?';
}

export function Avatar({ nombre, size = 80, colorBorde }: Props) {
  const tema = Colors[useColorScheme() ?? 'light'];

  return (
    <View
      style={[
        styles.borde,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colorBorde ?? 'transparent',
        },
      ]}>
      <LinearGradient
        colors={['#C777B0', tema.tint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.relleno}>
        <Text
          style={[styles.iniciales, { fontSize: size * 0.36 }]}
          lightColor="#FFFFFF"
          darkColor="#FFFFFF">
          {iniciales(nombre)}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  borde: { borderWidth: 4, overflow: 'hidden' },
  relleno: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iniciales: { fontFamily: 'Inter-Medium' },
});
