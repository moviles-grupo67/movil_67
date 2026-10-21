import { useAuth } from '@/contexts/auth-context';
import { Icono } from '@/components/Icono';
import { useState, useCallback, useEffect } from 'react';
import { obtenerEspacioPorId } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { crearReserva, obtenerTurnosOcupados } from '@/src/servicios/reservas';
import { crearTurnoId, inicioDeTurno, textoTurno, CUATRO_HORAS } from '@/src/utils/turnos';
import { vibrarExito, vibrarError, vibrarToque } from '@/src/servicios/vibracion';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { Pressable, FlatList, StyleSheet, Text, Alert, View, useWindowDimensions } from 'react-native';
import { Boton } from '@/components/Boton';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Carousel, Pagination } from 'react-native-reanimated-carousel';// Libreria Carrousel
import { useSharedValue } from 'react-native-reanimated'; // Libreria Carrousel
import { obtenerBloqueos } from '@/src/servicios/bloqueos';
import { obtenerReservasFijas } from '@/src/servicios/reservasFijas';
import { Bloqueo } from '@/src/tipos/bloqueo';
import { ReservaFija } from '@/src/tipos/reservaFija';
import { estaBloqueado, esFijo } from '@/src/utils/disponibilidad';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { obtenerDeportes } from '@/src/servicios/deportes';
import { Deporte } from '@/src/tipos/deporte';

const DIAS_VISIBLES = 7;

type Turno = { id: string; hora: number; estado: 'libre' | 'reservado' | 'fijo' | 'mantenimiento' };

const COLOR_ESTADO = {
  libre: '#C8E6C9',
  reservado: '#EF9A9A',
  fijo: '#FFE0B2',
  mantenimiento: '#E0E0E0',
};


function generarTurnos(espacioId: string, fecha: Date): Turno[] {
  const turnos: Turno[] = [];
  for (let hora = 8; hora < 24; hora++) {
    turnos.push({ id: crearTurnoId(espacioId, fecha, hora), hora, estado: 'libre' });
  }
  return turnos;
}

function nombreDelDia(fecha: Date, diaOffset: number): string {
  const diaYMes = fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  if (diaOffset === 0) return `Hoy, ${diaYMes}`;
  if (diaOffset === 1) return `Mañana, ${diaYMes}`;
  const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
  return `${diaSemana[0].toUpperCase()}${diaSemana.slice(1)} ${diaYMes}`;
}

const dosDigitos = (n: number) => String(n).padStart(2, '0');

export default function DetalleEspacio() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { sesion } = useAuth();
  const { width: anchoPantalla } = useWindowDimensions();
  const anchoMedio = anchoPantalla - 40;
  const progress = useSharedValue(0);
  const tema = Colors[useColorScheme() ?? 'light'];
  const [espacio, setEspacio] = useState<Espacio | undefined>(undefined);
  const player = useVideoPlayer(espacio?.videoUrl ?? null, (p) => {
    p.loop = true;
  });
  const [deportes, setDeportes] = useState<Deporte[]>([]);
    useEffect(() => {
      obtenerDeportes().then((r) => {
        if (!esError(r)) setDeportes(r.datos);
      });
    }, []);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [fijas, setFijas] = useState<ReservaFija[]>([]);
  const [diaOffset, setDiaOffset] = useState(0);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string | null>(null);
  useEffect(() => {
    obtenerEspacioPorId(String(id)).then((resultado) => {
      if (!esError(resultado)) {
        setEspacio(resultado.datos);
      }
    });
  }, [id]);
  useFocusEffect(
    useCallback(() => {
      obtenerTurnosOcupados(String(id)).then(setOcupados);
      obtenerBloqueos({ espacioId: String(id) }).then((r) => {
        if (!esError(r)) setBloqueos(r.datos);
      });
      obtenerReservasFijas({ espacioId: String(id), soloActivas: true }).then((r) => {
        if (!esError(r)) setFijas(r.datos);
      });
    }, [id])
  );

  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diaOffset);

  const ahora = Date.now();
  const turnos = espacio
    ? generarTurnos(espacio.id, fecha)
      .filter((t) => inicioDeTurno(t.id).getTime() > ahora)
      .map((t): Turno => {
        if (estaBloqueado(bloqueos, espacio.id, fecha, t.hora)) return { ...t, estado: 'mantenimiento' };
        if (esFijo(fijas, espacio.id, fecha, t.hora)) return { ...t, estado: 'fijo' };
        if (ocupados.includes(t.id)) return { ...t, estado: 'reservado' };
        return t;
      })
    : [];

  function cambiarDia(delta: number) {
    setDiaOffset((d) => d + delta);
    setTurnoSeleccionado(null);
  }

  async function confirmarReserva(usuarioId: string, espacioId: string, turnoId: string) {
    try {
      const reserva = await crearReserva({ espacioId, turnoId, usuarioId, cantidadPersonas: 1 });
      vibrarExito();
      router.back();
      router.push(
        { pathname: '/reservas/[id]', params: { id: reserva.id } },
        { withAnchor: true }
      );
    } catch (err) {
      vibrarError();
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  }

  function handleReservar() {
    if (!turnoSeleccionado || !espacio) return;

    if (!sesion) {
      router.push({
        pathname: '/ingreso',
        params: { resumen: `${espacio.nombre} · ${textoTurno(turnoSeleccionado)}` },
      });
      return;
    }

    const usuarioId = sesion.usuario.id;
    const espacioId = espacio.id;
    const turnoId = turnoSeleccionado;
    const faltan = inicioDeTurno(turnoId).getTime() - Date.now();

    if (faltan < CUATRO_HORAS) {
      Alert.alert(
        'Este turno no se podrá cancelar',
        'Faltan menos de 4 horas. Si después no podés ir, vas a tener que avisar a la Dirección de Deportes.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => confirmarReserva(usuarioId, espacioId, turnoId) },
        ]
      );
      return;
    }

    confirmarReserva(usuarioId, espacioId, turnoId);
  }

  const esPrimerDia = diaOffset === 0;
  const esUltimoDia = diaOffset === DIAS_VISIBLES - 1;

  if (!espacio) {
    return (
      <View style={styles.cargando}>
        <Text style={{ color: tema.text }}>Cargando...</Text>
      </View>
    );
  }
  const deporte = deportes.find((d) => d.id === espacio.deporteId);

  //Array de Imagenes y videos
  const medios = [
    ...espacio.imagenes.map((url) => ({ tipo: 'imagen' as const, url })),
    ...(espacio.videoUrl ? [{ tipo: 'video' as const, url: espacio.videoUrl }] : []),
  ];


  return (
    <>
      <Stack.Screen options={{ title: espacio.nombre }} />
      <FlatList
        data={turnos}
        keyExtractor={(turno) => turno.id}
        extraData={turnoSeleccionado}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        //Carrousel de imagenes y videos de las canchas
        ListHeaderComponent={
          <>
            {medios.length > 0 && (
              <Carousel
                data={medios}
                loop={false}
                progress={progress}
                style={{ width: anchoMedio, height: 220, borderRadius: 16, marginBottom: 12 }}
                renderItem={({ item }) =>
                  item.tipo === 'video' ? (
                    <VideoView player={player} style={{ width: anchoMedio, height: 220 }} />
                  ) : (
                    <Image source={{ uri: item.url }} style={{ width: anchoMedio, height: 220 }} />
                  )
                }
              />
            )}
            {medios.length > 1 && (
              <Pagination
                count={medios.length}
                progress={progress}
                dotStyle={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#D8C3D1' }}
                activeDotStyle={{ width: 16, height: 6, borderRadius: 3, backgroundColor: '#A4438C' }}
                containerStyle={{ gap: 6, marginBottom: 12, justifyContent: 'center' }}
              />
            )}
            <Text style={[styles.titulo, { color: tema.text }]}>{espacio?.nombre}</Text>
            <Text style={{ color: tema.text }}>$ {espacio?.precioPorHora.toLocaleString('es-AR')} por hora</Text>
            <Text style={[styles.subtitulo, { color: tema.text }]}>Características</Text>
            <View style={styles.chipsCaracteristicas}>
              <View style={[styles.chip, { backgroundColor: deporte?.color ?? tema.tint }]}>
                <Text style={[styles.textoChip, { color: '#FFFFFF' }]}>{deporte?.nombre}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: tema.tint + '22' }]}><Text style={[styles.textoChip, { color: tema.tint }]}>{espacio.superficie}</Text></View>
              <View style={[styles.chip, { backgroundColor: tema.tint + '22' }]}><Text style={[styles.textoChip, { color: tema.tint }]}>{espacio.techado ? 'Techada' : 'Al aire libre'}</Text></View>
              {espacio.iluminacion && (
                <View style={[styles.chip, { backgroundColor: tema.tint + '22' }]}><Text style={[styles.textoChip, { color: tema.tint }]}>Con luz</Text></View>
              )}
              <View style={[styles.chip, { backgroundColor: tema.tint + '22' }]}><Text style={[styles.textoChip, { color: tema.tint }]}>{espacio.capacidad} personas</Text></View>
            </View>

            <Text style={[styles.subtitulo, { color: tema.text }]}>Reglas del lugar</Text>
            <Text style={[styles.reglas, { color: tema.text }]}>{espacio.reglas}</Text>

            <View style={styles.selector}>
              <Pressable onPress={() => cambiarDia(-1)} disabled={esPrimerDia} hitSlop={12}>
                <View style={[styles.flechaIzq, esPrimerDia && styles.apagada]}>
                  <Icono nombre="chevron" color={tema.tint} size={24} />
                </View>
              </Pressable>
              <Text style={[styles.dia, { color: tema.tint }]}>{nombreDelDia(fecha, diaOffset)}</Text>
              <Pressable onPress={() => cambiarDia(1)} disabled={esUltimoDia} hitSlop={12}>
                <View style={esUltimoDia && styles.apagada}>
                  <Icono nombre="chevron" color={tema.tint} size={24} />
                </View>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item: turno }) => (
          <Pressable
            disabled={turno.estado !== 'libre'}
            onPress={() => {
              vibrarToque();
              setTurnoSeleccionado(turno.id);
            }}
            style={[
              styles.turno,
              { backgroundColor: COLOR_ESTADO[turno.estado] },
                turnoSeleccionado === turno.id && { borderWidth: 3, borderColor: tema.tint },
            ]}>
            <Text style={{ color: '#000' }}>
              {dosDigitos(turno.hora)}:00 - {dosDigitos(turno.hora + 1)}:00 · {turno.estado}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={[styles.vacio, { color: tema.tabIconDefault }]}>No quedan turnos para este día.</Text>
        }
        ListFooterComponent={
          turnoSeleccionado ? (
            <View style={{ marginTop: 16 }}>
              <Boton
                titulo={`Confirmar reserva de las ${dosDigitos(inicioDeTurno(turnoSeleccionado).getHours())}:00 hs`}
                onPress={handleReservar}
              />
            </View>
          ) : null
        }
      />
    </>
  );
} 

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: 'bold' },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  dia: { fontSize: 16, fontWeight: 'bold' },
  flechaIzq: { transform: [{ rotate: '180deg' }] },
  apagada: { opacity: 0.25 },
  turno: { padding: 10, marginVertical: 4, borderRadius: 8 },
  vacio: { textAlign: 'center', marginTop: 24 },
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  subtitulo: { fontFamily: 'Inter-Medium', fontSize: 15, marginTop: 16, marginBottom: 4 },
  reglas: { fontSize: 14, opacity: 0.8, lineHeight: 20 },
  chipsCaracteristicas: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  textoChip: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});