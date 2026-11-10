import Storage from 'expo-sqlite/kv-store';

import type { MisReservas } from '@/src/servicios/reservas';
import { Espacio } from '@/src/tipos/espacio';

export interface ReservasGuardadas {
  reservas: MisReservas;
  espacios: Espacio[]; // esto muestra el nombre de la cancha sin conexion ;)
  guardadoEn: string;
}

const clave = (usuarioId: string) => `mis-reservas-${usuarioId}`;

export async function guardarReservas(
  usuarioId: string,
  reservas: MisReservas,
  espacios: Espacio[],
): Promise<void> {
  try {
    const copia: ReservasGuardadas = { reservas, espacios, guardadoEn: new Date().toISOString() };
    await Storage.setItem(clave(usuarioId), JSON.stringify(copia));
  } catch {

  }
}

export async function leerReservasGuardadas(usuarioId: string): Promise<ReservasGuardadas | null> {
  try {
    const crudo = await Storage.getItem(clave(usuarioId));
    return crudo ? (JSON.parse(crudo) as ReservasGuardadas) : null;
  } catch {
    return null;
  }
}