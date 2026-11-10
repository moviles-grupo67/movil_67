import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reserva } from '@/src/tipos/reserva';
import { inicioDeTurno, textoTurno } from '@/src/utils/turnos';

// Se declara una vez. Decide que pasa con una notificacion si llega mientras la app esta abierta.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DOS_HORAS = 1000 * 60 * 60 * 2;

//Permiso de notifaciones. 
export async function pedirPermisoAvisos(): Promise<boolean> {
  if (Platform.OS === 'android') {
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

// Recordatorio de 2hs antes del turno (notificación local)
export async function programarRecordatorioTurno(
  reserva: Reserva,
  nombreEspacio: string
): Promise<ResultadoRecordatorio> {
  const tienePermiso = await pedirPermisoAvisos();
  if (!tienePermiso) return 'sin_permiso';

  const inicioTurno = inicioDeTurno(reserva.turnoId);
  const disparo = new Date(inicioTurno.getTime() - DOS_HORAS);

  if (disparo.getTime() <= Date.now()) return 'turno_cercano';

  await Notifications.scheduleNotificationAsync({
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

  return 'programado';
}

// Busca el recordatorio pendiente de esta reserva y lo cancela.
export async function cancelarRecordatorioTurno(reservaId: string): Promise<void> {
  const pendientes = await Notifications.getAllScheduledNotificationsAsync();
  const encontrada = pendientes.find((n) => n.content.data?.reservaId === reservaId);
  if (!encontrada) return;
  await Notifications.cancelScheduledNotificationAsync(encontrada.identifier);
}
