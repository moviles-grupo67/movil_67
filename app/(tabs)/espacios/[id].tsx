import { useAuth } from '@/contexts/auth-context';
import { Icono } from '@/components/Icono';
import { useState, useCallback, useEffect } from 'react';
import { obtenerEspacioPorId } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { crearReserva } from '@/src/servicios/reservas';
import { programarRecordatorioTurno } from '@/src/servicios/avisos';
import { obtenerTurnos } from '@/src/servicios/turnos';
import { Turno } from '@/src/tipos/turno';
import { inicioDeTurno, textoTurno, CUATRO_HORAS } from '@/src/utils/turnos';
import { vibrarExito, vibrarError, vibrarToque } from '@/src/servicios/vibracion';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { Pressable, FlatList, StyleSheet, Text, Alert, View, useWindowDimensions } from 'react-native';
import { Boton } from '@/components/Boton';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Carousel, Pagination } from 'react-native-reanimated-carousel';// Libreria Carrousel
import { useSharedValue } from 'react-native-reanimated'; // Libreria Carrousel
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { obtenerDeportes } from '@/src/servicios/deportes';
import { Deporte } from '@/src/tipos/deporte';

const DIAS_VISIBLES = 7;

const COLOR_ESTADO = {
  libre: '#C8E6C9',
  reservado: '#EF9A9A',
  fijo: '#FFE0B2',
  mantenimiento: '#E0E0E0',
};

function fechaDelOffset(diaOffset: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diaOffset);
  return fecha;
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
  const { sesion, alternarFavorito } = useAuth();
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
  const [turnosApi, setTurnosApi] = useState<Turno[]>([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(true);
  const [errorTurnos, setErrorTurnos] = useState<string | null>(null);
  const [diaOffset, setDiaOffset] = useState(0);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string | null>(null);
  useEffect(() => {
    obtenerEspacioPorId(String(id)).then((resultado) => {
      if (!esError(resultado)) {
        setEspacio(resultado.datos);
      }
    });
  }, [id]);
  const cargarTurnos = useCallback(() => {
    let cancelado = false;
    setCargandoTurnos(true);
    setErrorTurnos(null);
    setTurnosApi([]);
    obtenerTurnos(String(id), fechaDelOffset(diaOffset)).then((r) => {
      if (cancelado) return;
      if (esError(r)) setErrorTurnos(r.error.mensaje);
      else setTurnosApi(r.datos);
      setCargandoTurnos(false);
    });
    return () => {
      cancelado = true;
    };
  }, [id, diaOffset]);
  useFocusEffect(cargarTurnos);

  const fecha = fechaDelOffset(diaOffset);

  const ahora = Date.now();
  const turnos = turnosApi.filter((t) => inicioDeTurno(t.id).getTime() > ahora);

  function cambiarDia(delta: number) {
    setDiaOffset((d) => d + delta);
    setTurnoSeleccionado(null);
  }

  async function confirmarReserva(usuarioId: string, espacioId: string, turnoId: string, nombreEspacio: string) {
    try {
      const reserva = await crearReserva({ espacioId, turnoId, usuarioId, cantidadPersonas: 1 });
      const avisoProgramado = await programarRecordatorioTurno(reserva, nombreEspacio);
      if (!avisoProgramado) {
        alert('Reserva confirmada. No vas a recibir el recordatorio porque las notificaciones están desactivadas.');
      }
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
          { text: 'Continuar', onPress: () => confirmarReserva(usuarioId, espacioId, turnoId, espacio.nombre) },
        ]
      );
      return;
    }

    confirmarReserva(usuarioId, espacioId, turnoId, espacio.nombre);
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

  const esFavorito = sesion?.usuario.espaciosFavoritos.includes(espacio?.id ?? '') ?? false;

    function handleFavorito() {
      if (!espacio) return;
      if (!sesion) {
        router.push({
          pathname: '/ingreso',
          params: { resumen: `Marcar ${espacio.nombre} como favorito` },
        });
        return;
      }
      alternarFavorito(espacio.id);
    }

  return (
    <>
      <Stack.Screen
        options={{
          title: espacio.nombre,
          headerRight: () => (
            <Pressable onPress={handleFavorito} hitSlop={12}>
              <Icono
                nombre="estrella"
                color='#FFFFFF'
                size={22}
                relleno={esFavorito}
              />
            </Pressable>
          ),
        }}
      />
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
              {turno.inicio} - {turno.fin} · {turno.estado}
              {turno.estado === 'libre' ? ` · $ ${turno.precio.toLocaleString('es-AR')}` : ''}
              {turno.motivoBloqueo ? ` (${turno.motivoBloqueo})` : ''}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          cargandoTurnos ? (
            <Text style={[styles.vacio, { color: tema.tabIconDefault }]}>Cargando turnos...</Text>
          ) : errorTurnos ? (
            <View style={{ alignItems: 'center', gap: 12, marginTop: 24 }}>
              <Text style={[styles.vacio, { color: tema.text, marginTop: 0 }]}>{errorTurnos}</Text>
              <Boton titulo="Reintentar" variante="secundario" onPress={() => cargarTurnos()} />
            </View>
          ) : (
            <Text style={[styles.vacio, { color: tema.tabIconDefault }]}>No quedan turnos para este día.</Text>
          )
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
