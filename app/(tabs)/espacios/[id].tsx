import { useAuth } from '@/contexts/auth-context';
import { Icono } from '@/components/Icono';
import { espacios } from '@/src/mocks/espacios';
import { crearReserva, obtenerTurnosOcupados } from '@/src/servicios/reservas';
import { crearTurnoId, inicioDeTurno, textoTurno, CUATRO_HORAS } from '@/src/utils/turnos';
import { vibrarExito, vibrarError, vibrarToque } from '@/src/servicios/vibracion';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Pressable, FlatList, StyleSheet, Text, Alert, View } from 'react-native';
import { Boton } from '@/components/Boton';

// Zequi, vos podes checkear esto y modificarlo a tu gusto, es tu parte :) 

const DIAS_VISIBLES = 7;

type Turno = { id: string; hora: number; estado: 'libre' | 'ocupado' };

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
  const espacio = espacios.find((e) => e.id === id);

  const [ocupados, setOcupados] = useState<string[]>([]);
  const [diaOffset, setDiaOffset] = useState(0);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      obtenerTurnosOcupados(String(id)).then(setOcupados);
    }, [id])
  );

  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diaOffset);

  const ahora = Date.now();
  const turnos = espacio
    ? generarTurnos(espacio.id, fecha)
      .filter((t) => inicioDeTurno(t.id).getTime() > ahora)
      .map((t) => (ocupados.includes(t.id) ? { ...t, estado: 'ocupado' as const } : t))
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

  return (
    <FlatList
      data={turnos}
      keyExtractor={(turno) => turno.id}
      extraData={turnoSeleccionado}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          <Text style={styles.titulo}>{espacio?.nombre}</Text>
          <Text>$ {espacio?.precioPorHora.toLocaleString('es-AR')} por hora</Text>

          <View style={styles.selector}>
            <Pressable onPress={() => cambiarDia(-1)} disabled={esPrimerDia} hitSlop={12}>
              <View style={[styles.flechaIzq, esPrimerDia && styles.apagada]}>
                <Icono nombre="chevron" color="#A4438C" size={24} />
              </View>
            </Pressable>
            <Text style={styles.dia}>{nombreDelDia(fecha, diaOffset)}</Text>
            <Pressable onPress={() => cambiarDia(1)} disabled={esUltimoDia} hitSlop={12}>
              <View style={esUltimoDia && styles.apagada}>
                <Icono nombre="chevron" color="#A4438C" size={24} />
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
            { backgroundColor: turno.estado === 'libre' ? '#C8E6C9' : '#EF9A9A' },
            turnoSeleccionado === turno.id && styles.turnoElegido,
          ]}>
          <Text style={{ color: '#000' }}>
            {dosDigitos(turno.hora)}:00 - {dosDigitos(turno.hora + 1)}:00 · {turno.estado}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.vacio}>No quedan turnos para este día.</Text>
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
  dia: { fontSize: 16, fontWeight: 'bold', color: '#A4438C' },
  flechaIzq: { transform: [{ rotate: '180deg' }] },
  apagada: { opacity: 0.25 },
  turno: { padding: 10, marginVertical: 4, borderRadius: 8 },
  turnoElegido: { borderWidth: 3, borderColor: '#A4438C' },
  vacio: { textAlign: 'center', color: '#999', marginTop: 24 },
  boton: { backgroundColor: '#A4438C', padding: 14, borderRadius: 8, marginTop: 16 },
  textoBoton: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});