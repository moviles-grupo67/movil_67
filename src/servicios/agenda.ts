import { pedir } from '@/src/servicios/cliente-api';
import { Respuesta } from '@/src/tipos/api';
import { Turno } from '@/src/tipos/turno';

export function obtenerAgenda(fecha: string): Promise<Respuesta<Turno[]>> {
  return pedir<Turno[]>({
    method: 'GET',
    url: '/agenda',
    params: { fecha, porPagina: 500 },
  });
}
