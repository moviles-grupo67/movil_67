import { pedir } from '@/src/servicios/cliente-api';
import { Respuesta } from '@/src/tipos/api';
import { Turno } from '@/src/tipos/turno';
import { fechaISO } from '@/src/utils/turnos';

export function obtenerTurnos(espacioId: string, fecha: Date): Promise<Respuesta<Turno[]>> {
  return pedir<Turno[]>({
    method: 'GET',
    url: `/espacios/${espacioId}/turnos`,
    params: { fecha: fechaISO(fecha) },
  });
}
