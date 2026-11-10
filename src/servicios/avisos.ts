import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reserva } from '@/src/tipos/reserva';
import { inicioDeTurno, textoTurno } from '@/src/utils/turnos';


// Se declara una sola vez, al cargar el módulo — define qué pasa con un aviso
// si llega mientras la app está abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DOS_HORAS = 1000 * 60 * 60 * 2;

// Guarda qué notificación corresponde a cada reserva, para poder cancelarla
// si el usuario cancela la reserva. No va en el tipo Reserva porque ese tipo
// lo define la consigna y no se toca.
const idsPorReserva = new Map<string, string>();

export async function pedirPermisoAvisos(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // El canal tiene que existir ANTES de pedir el permiso.
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Avisos de reservas',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;

  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.status === 'granted';
}

export type ResultadoRecordatorio = 'programado' | 'sin_permiso' | 'turno_cercano';

export async function programarRecordatorioTurno(
  reserva: Reserva,
  nombreEspacio: string
): Promise<ResultadoRecordatorio> {
  const tienePermiso = await pedirPermisoAvisos();
  if (!tienePermiso) return 'sin_permiso';

  const inicioTurno = inicioDeTurno(reserva.turnoId);
  const disparo = new Date(inicioTurno.getTime() - DOS_HORAS);

  if (disparo.getTime() <= Date.now()) return 'turno_cercano';

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tu turno se acerca',
      body: `${nombreEspacio} — ${textoTurno(reserva.turnoId)}.`,
      data: { reservaId: reserva.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: disparo,
    },
  });

  idsPorReserva.set(reserva.id, id);
  return 'programado';
}


export async function cancelarRecordatorioTurno(reservaId: string): Promise<void> {
  const id = idsPorReserva.get(reservaId);
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id);
  idsPorReserva.delete(reservaId);
}