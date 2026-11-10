import { View, StyleSheet, Pressable, Animated, FlatList, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import { Icono } from '@/components/Icono';
import { useState, useCallback, useRef, useEffect } from 'react';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { useFocusEffect, useRouter } from 'expo-router';
import { Reserva } from '@/src/tipos/reserva';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Boton } from '@/components/Boton';
import { obtenerReservas, MisReservas } from '@/src/servicios/reservas';
import { textoTurno, inicioDeTurno } from '@/src/utils/turnos';
import { guardarReservas, leerReservasGuardadas } from '@/src/servicios/reservas-guardadas';

const ANCHO_OPCION = 100;
const NOMBRE_ESTADO = {
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  cumplida: 'Cumplida',
  ausente: 'No se presentó',
};

export default function ReservasScreen() {
  const [misReservas, setMisReservas] = useState<MisReservas>({ proximas: [], pasadas: [] });
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sesion } = useAuth();
  const router = useRouter();
  const tema = Colors[useColorScheme() ?? 'light'];

    const cargar = useCallback(async () => {
    if (!sesion) {
      setMisReservas({ proximas: [], pasadas: [] });
      setCargando(false);
      return;
    }
    const usuarioId = sesion.usuario.id;
    setCargando(true);
    setError(null);

    async function usarCopiaGuardada(mensaje: string) {
      setError(mensaje);
      const copia = await leerReservasGuardadas(usuarioId);
      if (copia) {
        setMisReservas(copia.reservas);
        setEspacios(copia.espacios);
      }
    }

    const [rReservas, rEspacios] = await Promise.all([obtenerReservas(), obtenerEspacios()]);
    if (esError(rReservas)) {
      await usarCopiaGuardada(rReservas.error.mensaje);
    } else if (esError(rEspacios)) {
      await usarCopiaGuardada(rEspacios.error.mensaje);
    } else {
      setMisReservas(rReservas.datos);
      setEspacios(rEspacios.datos);
      guardarReservas(usuarioId, rReservas.datos, rEspacios.datos); // la "foto" para después
    }
    setCargando(false);
  }, [sesion]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const [pestaña, setPestaña] = useState<'próximas' | 'pasadas'>('próximas');

  // Próximas: de la más cercana a la más lejana. Pasadas: de la más reciente a la más vieja.
  const reservasFiltradas = (pestaña === 'próximas' ? misReservas.proximas : misReservas.pasadas)
    .slice()
    .sort((a, b) => {
      const diferencia = inicioDeTurno(a.turnoId).getTime() - inicioDeTurno(b.turnoId).getTime();
      return pestaña === 'próximas' ? diferencia : -diferencia;
    });
  
  const hayDatos = misReservas.proximas.length + misReservas.pasadas.length > 0;

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
            {error && hayDatos && (
        <Pressable onPress={cargar} style={[styles.aviso, { backgroundColor: tema.tint + '22' }]}>
          <Text style={[styles.textoAviso, { color: tema.tint }]}>
                {error} Mostrando lo último guardado. Tocá para reintentar.
          </Text>
        </Pressable>
      )}
      <FlatList
        data={reservasFiltradas}
        keyExtractor={(reserva) => reserva.id}
        renderItem={({ item: reserva }) => {
          const espacio = espacios.find((e) => e.id === reserva.espacioId);
          const etiqueta =
            pestaña === 'pasadas' && reserva.estado === 'confirmada'
              ? 'No se presentó'
              : NOMBRE_ESTADO[reserva.estado];
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
                  {etiqueta}
                </Text>
              </View>
              <Icono nombre="chevron" color={tema.tabIconDefault} size={20} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          cargando ? (
            <ActivityIndicator color={tema.tint} style={{ marginTop: 40 }} />
          ) : error ? (
            <View style={styles.vacio}>
              <Text style={styles.textoVacio}>{error}</Text>
              <Boton titulo="Reintentar" variante="secundario" onPress={cargar} />
            </View>
          ) : (
            <View style={styles.vacio}>
              <Text style={styles.textoVacio}>No hay reservas</Text>
              <Boton titulo="¡Reservá tu cancha ya!" onPress={() => router.navigate('/espacios')} />
            </View>
          )
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
  aviso: { padding: 10, borderRadius: 12, marginBottom: 12 },
  textoAviso: { fontFamily: 'Inter-Medium', fontSize: 13, textAlign: 'center' },
});