import { pedir } from '@/src/servicios/cliente-api';
import { Deporte } from '@/src/tipos/deporte';
import { Respuesta } from '@/src/tipos/api';

export function obtenerDeportes(): Promise<Respuesta<Deporte[]>> {
  return pedir<Deporte[]>({ method: 'GET', url: '/deportes' });
}
