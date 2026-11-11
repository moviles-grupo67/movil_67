import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { pedir } from '@/src/servicios/cliente-api';
import { esError } from '@/src/tipos/api';
import { pedirPermisoAvisos } from '@/src/servicios/avisos';

type Plataforma = 'ios' | 'android';

interface Dispositivo {
  tokenExpo: string;
  plataforma: Plataforma;
}

export async function registrarDispositivoPush(): Promise<void> {
  if (!Device.isDevice) return;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

  const tienePermiso = await pedirPermisoAvisos();
  if (!tienePermiso) return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  try {
    const { data: tokenExpo } = await Notifications.getExpoPushTokenAsync({ projectId });
    const respuesta = await pedir<Dispositivo>({
      method: 'POST',
      url: '/dispositivos',
      data: { tokenExpo, plataforma: Platform.OS as Plataforma },
    });
    if (esError(respuesta)) {
      console.log('No se pudo registrar el dispositivo:', respuesta.error.mensaje);
    }
  } catch (error) {
    console.log('No se pudo generar el token de push:', error);
  }
}
