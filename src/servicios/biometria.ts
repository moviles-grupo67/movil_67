import * as LocalAuthentication from 'expo-local-authentication';

export async function biometriaDisponible(): Promise<boolean> {
  try {
    const nivel = await LocalAuthentication.getEnrolledLevelAsync();
    return nivel !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

export async function autenticar(motivo: string): Promise<boolean> {
  try {
    if (!(await biometriaDisponible())) return false;
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: motivo,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });
    return resultado.success;
  } catch {
    return false;
  }
}
