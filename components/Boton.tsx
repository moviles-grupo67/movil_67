import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: 'principal' | 'secundario' | 'peligro';
  cargando?: boolean;
  deshabilitado?: boolean;
}

const ROJO_PELIGRO = '#B71C1C';

export function Boton({ titulo, onPress, variante = 'principal', cargando, deshabilitado }: Props) {
  const tema = Colors[useColorScheme() ?? 'light'];
  const inactivo = cargando || deshabilitado;

  const contenido = cargando ? (
    <ActivityIndicator color={variante === 'secundario' ? tema.tint : '#FFFFFF'} />
  ) : (
    <Text
      style={styles.texto}
      lightColor={variante === 'secundario' ? undefined : '#FFFFFF'}
      darkColor={variante === 'secundario' ? undefined : '#FFFFFF'}>
      {titulo}
    </Text>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      style={[
        styles.base,
        variante === 'secundario' && {
          backgroundColor: tema.surface,
          borderWidth: 1,
          borderColor: tema.tabIconDefault + '55',
        },
        variante === 'peligro' && { backgroundColor: ROJO_PELIGRO },
        variante === 'principal' && styles.sombra,
        inactivo && styles.inactivo,
      ]}>
      {variante === 'principal' && (
        <LinearGradient
          colors={['#C777B0', tema.tint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {contenido}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  texto: { fontFamily: 'Inter-Medium', fontSize: 16 },
  sombra: {
    shadowColor: '#A4438C',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  inactivo: { opacity: 0.6 },
});
