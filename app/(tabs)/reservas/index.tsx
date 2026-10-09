import { View, StyleSheet, Pressable, Animated, FlatList } from 'react-native';
import { Text } from '@/components/Themed';
import { Icono } from '@/components/Icono';
import { useState, useCallback, useRef } from 'react';
import { obtenerReservas } from '@/src/servicios/reservas';
import { espacios } from '@/src/mocks/espacios';
import { useFocusEffect, useRouter } from 'expo-router';
import { Reserva } from '@/src/tipos/reserva';
import { useAuth } from '@/contexts/auth-context';
import { textoTurno } from '@/src/utils/turnos';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Boton } from '@/components/Boton';

const ANCHO_OPCION = 100;
const NOMBRE_ESTADO = {
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  cumplida: 'Cumplida',
  ausente: 'No se presentó',
};

export default function ReservasScreen() {

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const { sesion } = useAuth();
  const router = useRouter();
  const tema = Colors[useColorScheme() ?? 'light'];

  useFocusEffect(
    useCallback(() => {
      if (!sesion) {
        setReservas([]);
        return;
      }
      obtenerReservas(sesion.usuario.id).then(setReservas);
    }, [sesion])
  );

  const [pestaña, setPestaña] = useState<'próximas' | 'pasadas'>('próximas');
  const reservasFiltradas = reservas.filter((r) => pestaña === 'próximas' ? r.estado === 'confirmada' : r.estado !== 'confirmada')

  const desplazamiento = useRef(new Animated.Value(0)).current;

  function cambiarPestaña(nueva: 'próximas' | 'pasadas') {
    setPestaña(nueva);
    Animated.spring(desplazamiento, {
      toValue: nueva === 'próximas' ? 0 : ANCHO_OPCION,
      useNativeDriver: true,
    }).start();
  }

  return (
    <View style={styles.container}>

      <View style={styles.segmento}>
        <Animated.View
          style={[styles.perilla, { transform: [{ translateX: desplazamiento }] }]}
        />
        <Pressable style={styles.opcion} onPress={() => cambiarPestaña('próximas')}>
          <Text style={[styles.textoOpcion, pestaña === 'próximas' && styles.textoActivo]}>
            Próximas
          </Text>
        </Pressable>
        <Pressable style={styles.opcion} onPress={() => cambiarPestaña('pasadas')}>
          <Text style={[styles.textoOpcion, pestaña === 'pasadas' && styles.textoActivo]}>
            Pasadas
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={reservasFiltradas}
        keyExtractor={(reserva) => reserva.id}
        renderItem={({ item: reserva }) => {
          const espacio = espacios.find((e) => e.id === reserva.espacioId);
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/reservas/[id]', params: { id: reserva.id } })}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: tema.surface, borderColor: tema.tabIconDefault + '33' },
                pressed && styles.presionada,
              ]}>
              <View style={styles.info}>
                <Text style={styles.cardTitulo}>{espacio?.nombre}</Text>
                <Text style={[styles.cardFecha, { color: tema.tint }]}>{textoTurno(reserva.turnoId)}</Text>
                <Text style={[styles.chip, { color: tema.tint, backgroundColor: tema.tint + '22' }]}>
                  {NOMBRE_ESTADO[reserva.estado]}
                </Text>
              </View>
              <Icono nombre="chevron" color={tema.tabIconDefault} size={20} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.textoVacio}>No hay reservas</Text>
            <Boton titulo="¡Reservá tu cancha ya!" onPress={() => router.navigate('/espacios')} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, width: '100%' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  presionada: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  info: { flex: 1, gap: 4 },
  cardTitulo: { fontFamily: 'Inter-Medium', fontSize: 17 },
  cardFecha: { fontFamily: 'Inter-Medium', fontSize: 15 },
  chip: {
    alignSelf: 'flex-start',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  segmento: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  opcion: { width: ANCHO_OPCION, paddingVertical: 8, alignItems: 'center' },
  textoOpcion: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#A4438C' },
  textoActivo: { color: '#fff' },
  perilla: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: ANCHO_OPCION,
    borderRadius: 999,
    backgroundColor: '#A4438C',
  },
  vacio: { alignItems: 'center', marginTop: 40, gap: 16 },
  textoVacio: { fontFamily: 'Inter-Regular', fontSize: 16, opacity: 0.5 },
  botonVacio: { backgroundColor: '#A4438C', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  textoBotonVacio: { fontFamily: 'Inter-Medium', color: '#fff' },
});