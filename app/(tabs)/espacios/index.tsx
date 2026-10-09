import { StyleSheet, FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { espacios } from '@/src/mocks/espacios';
import { Text } from '@/components/Themed';
import { Icono } from '@/components/Icono';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

//Aca complete un poco para poder probar reservas pero pueden modificar cuando les toque el turno

export default function EspaciosScreen() {

  const tema = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();

  return (
    <FlatList
      data={espacios}
      keyExtractor={(espacio) => espacio.id}
      contentContainerStyle={styles.lista}
      renderItem={({ item: espacio }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/espacios/[id]', params: { id: espacio.id } })}
          style={({ pressed }) => [
            styles.tarjeta,
            { backgroundColor: tema.surface, borderColor: tema.tabIconDefault + '33' },
            pressed && styles.presionada,
          ]}>
          <View style={styles.info}>
            <Text style={styles.nombre}>{espacio.nombre}</Text>
            <Text style={styles.complejo}>{espacio.complejo}</Text>

            <View style={styles.chips}>
              <Text style={[styles.chip, { color: tema.tint, backgroundColor: tema.tint + '22' }]}>
                {espacio.techado ? 'Techada' : 'Al aire libre'}
              </Text>
              {espacio.iluminacion && (
                <Text style={[styles.chip, { color: tema.tint, backgroundColor: tema.tint + '22' }]}>
                  Con luz
                </Text>
              )}
            </View>

            <Text style={[styles.precio, { color: tema.tint }]}>
              $ {espacio.precioPorHora.toLocaleString('es-AR')} / hora
            </Text>
          </View>

          <Icono nombre="chevron" color={tema.tabIconDefault} size={20} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 20, gap: 12 },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  presionada: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  info: { flex: 1, gap: 4 },
  nombre: { fontFamily: 'Inter-Medium', fontSize: 17 },
  complejo: { fontFamily: 'Inter-Regular', fontSize: 13, opacity: 0.6 },
  chips: { flexDirection: 'row', gap: 6, marginTop: 6 },
  chip: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  precio: { fontFamily: 'Inter-Medium', fontSize: 15, marginTop: 6 },
});