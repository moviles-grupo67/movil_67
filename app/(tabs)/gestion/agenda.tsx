import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { obtenerAgenda } from '@/src/servicios/agenda';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { marcarAusente, obtenerReservaPorId } from '@/src/servicios/reservas';
import { obtenerUsuarioPorId } from '@/src/servicios/usuarios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { EstadoTurno, Turno } from '@/src/tipos/turno';
import { fechaISO, textoDia } from '@/src/utils/turnos';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
} from 'react-native';

const ETIQUETA: Record<EstadoTurno, string> = {
  libre: 'Libre',
  reservado: 'Reservado',
  fijo: 'Reserva fija',
  mantenimiento: 'Bloqueado',
};

const COLOR: Record<EstadoTurno, string> = {
  libre: '#2E7D32',
  reservado: '#1565C0',
  fijo: '#6A1B9A',
  mantenimiento: '#B71C1C',
};

export default function AgendaScreen() {
  const tema = Colors[useColorScheme() ?? 'light'];

  const [fecha, setFecha] = useState(new Date());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuenta los pedidos: si el usuario cambia de día rápido, solo vale el último.
  const pedido = useRef(0);

  async function cargar(esRefresco = false) {
    const numero = ++pedido.current;
    if (esRefresco) setRefrescando(true);
    else setCargando(true);
    setError(null);

    const [rAgenda, rEspacios] = await Promise.all([
      obtenerAgenda(fechaISO(fecha)),
      obtenerEspacios(),
    ]);
    if (numero !== pedido.current) return; // llegó una respuesta vieja

    if (esError(rAgenda)) setError(rAgenda.error.mensaje);
    else if (esError(rEspacios)) setError(rEspacios.error.mensaje);
    else {
      setTurnos(rAgenda.datos);
      setEspacios(rEspacios.datos);
    }
    setCargando(false);
    setRefrescando(false);
  }

  // Corre al entrar a la pantalla y cada vez que cambia el día.
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [fecha]),
  );

  function moverDia(dias: number) {
    const nueva = new Date(fecha);
    nueva.setDate(nueva.getDate() + dias);
    setFecha(nueva);
  }

  function nombreEspacio(id: string) {
    return espacios.find((e) => e.id === id)?.nombre ?? id;
  }

  async function verReserva(turno: Turno) {
    if (!turno.reservaId) return;

    const rReserva = await obtenerReservaPorId(turno.reservaId);
    if (esError(rReserva)) {
      Alert.alert('No se pudo cargar la reserva', rReserva.error.mensaje);
      return;
    }
    const reserva = rReserva.datos;
    const rUsuario = await obtenerUsuarioPorId(reserva.usuarioId);
    const nombre = esError(rUsuario)
      ? 'Usuario desconocido'
      : rUsuario.datos.nombre;
    const telefono = esError(rUsuario) ? '—' : rUsuario.datos.telefono;
    const tardias = esError(rUsuario) ? 0 : rUsuario.datos.cancelacionesTardias;
    const ausencias = esError(rUsuario) ? 0 : rUsuario.datos.ausencias;

    const antecedentes =
      tardias > 0 || ausencias > 0
        ? `\n⚠ ${tardias} cancelación(es) tardía(s) · ${ausencias} ausencia(s)`
        : '';

    const botones = [];
    if (reserva.estado === 'confirmada') {
      botones.push({
        text: 'Marcar ausente',
        style: 'destructive' as const,
        onPress: () => ausente(reserva.id),
      });
    }
    botones.push({ text: 'Cerrar', style: 'cancel' as const });

    Alert.alert(
      nombre,
      `${nombreEspacio(turno.espacioId)} · ${turno.inicio} a ${turno.fin} hs\n` +
        `Teléfono: ${telefono}\n` +
        `${reserva.cantidadPersonas} personas · ${reserva.estado}` +
        `${antecedentes}`,
      botones,
    );
  }

  async function ausente(reservaId: string) {
    const r = await marcarAusente(reservaId);
    if (esError(r)) {
      Alert.alert('No se pudo marcar', r.error.mensaje);
      return;
    }
    Alert.alert('Listo', 'La reserva quedó marcada como ausente.');
    cargar(true);
  }

  const secciones = espacios
    .map((e) => ({
      title: e.nombre,
      data: turnos.filter((t) => t.espacioId === e.id),
    }))
    .filter((s) => s.data.length > 0);

  const esHoy = fechaISO(fecha) === fechaISO(new Date());
  const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });

  return (
    <View style={styles.contenedor}>
      <View style={styles.selector}>
        <Pressable onPress={() => moverDia(-1)} hitSlop={12}>
          <Text style={[styles.flecha, { color: tema.tint }]}>‹</Text>
        </Pressable>
        <Text style={styles.fecha}>
          {esHoy ? 'Hoy · ' : ''}
          {diaSemana} {textoDia(fecha)}
        </Text>
        <Pressable onPress={() => moverDia(1)} hitSlop={12}>
          <Text style={[styles.flecha, { color: tema.tint }]}>›</Text>
        </Pressable>
      </View>

      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={tema.tint} />
        </View>
      ) : error ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(t) => t.id}
          refreshing={refrescando}
          onRefresh={() => cargar(true)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.lista}
          renderSectionHeader={({ section }) => (
            <Text style={styles.espacio}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <Pressable
              disabled={!item.reservaId}
              onPress={() => verReserva(item)}
              style={styles.fila}
            >
              <Text style={styles.hora}>
                {item.inicio} - {item.fin}
              </Text>
              <Text style={{ color: COLOR[item.estado], fontWeight: '600' }}>
                {ETIQUETA[item.estado]}
                {item.estado === 'mantenimiento' && item.motivoBloqueo
                  ? ` · ${item.motivoBloqueo}`
                  : ''}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  flecha: { fontSize: 32, fontWeight: '700' },
  fecha: { fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  lista: { paddingHorizontal: 16, paddingBottom: 24 },
  espacio: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#B7A3AC55',
  },
  hora: { fontSize: 15 },
  error: { color: '#D32F2F', fontSize: 14, textAlign: 'center' },
});
