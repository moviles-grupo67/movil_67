import { useAuth } from '@/contexts/auth-context';
import { espacios } from '@/src/mocks/espacios';
import { crearReserva, obtenerTurnosOcupados } from '@/src/servicios/reservas';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, Alert, View } from 'react-native';


function generarTurnos() {
  const turnos = [];
  for (let hora = 8; hora < 24; hora++) {
    const estado = hora === 19 || hora === 21 ? 'ocupado' : 'libre';
    turnos.push({ inicio: `${hora}:00`, fin: `${hora + 1}:00`, estado });
  }
  return turnos;
}

export default function DetalleEspacio() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { sesion } = useAuth();
  const espacio = espacios.find((e) => e.id === id);
  const [ocupados, setOcupados] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      obtenerTurnosOcupados(String(id)).then(setOcupados);
    }, [id])
  );

  const turnos = generarTurnos().map((t) =>
    ocupados.includes(t.inicio) ? { ...t, estado: 'ocupado' } : t
  );
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string | null>(null);

  async function confirmarReserva(usuarioId: string, espacioId: string, turnoId: string) {
    try {
      const reserva = await crearReserva({
        espacioId,
        turnoId,
        usuarioId,
        cantidadPersonas: 1,
      });
      router.replace('/espacios');
      router.push(
        { pathname: '/reservas/[id]', params: { id: reserva.id } },
        { withAnchor: true }
      );
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  }

  function handleReservar() {
    if (!turnoSeleccionado || !espacio) return;

    if (!sesion) {
      router.push('/ingreso');
      return;
    }

    const usuarioId = sesion.usuario.id;
    const espacioId = espacio.id;
    const turnoId = turnoSeleccionado;

    const [hora] = turnoId.split(':');
    const inicioTurno = new Date();
    inicioTurno.setHours(Number(hora), 0, 0, 0);
    const cuatroHoras = 1000 * 60 * 60 * 4;
    const faltan = inicioTurno.getTime() - Date.now();

    if (faltan < cuatroHoras) {
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

  return (
    <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>{espacio?.nombre}</Text>
      <Text>Precio por hora: ${espacio?.precioPorHora}</Text>

      <Text style={[styles.titulo, { marginTop: 16, fontSize: 16 }]}>Turnos de hoy</Text>
      {turnos.map((turno) => (
        <Pressable
          key={turno.inicio}
          disabled={turno.estado === 'ocupado'}
          onPress={() => setTurnoSeleccionado(turno.inicio)}
          style={{
            padding: 10,
            marginVertical: 4,
            borderRadius: 8,
            borderWidth: turnoSeleccionado === turno.inicio ? 3 : 0,
            borderColor: '#A4438C',
            backgroundColor: turno.estado === 'libre' ? '#C8E6C9' : '#EF9A9A',
          }}>
          <Text style={{ color: '#000' }}>
            {turno.inicio} - {turno.fin} · {turno.estado}
          </Text>
        </Pressable>
      ))}

      {turnoSeleccionado && (
        <Pressable style={styles.boton} onPress={handleReservar}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
            Confirmar reserva de {turnoSeleccionado}hs
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: 'bold' },
  boton: { backgroundColor: '#A4438C', padding: 14, borderRadius: 8, marginTop: 16 },
});