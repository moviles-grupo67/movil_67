import { pedir } from '@/src/servicios/cliente-api';
import { Deporte } from '@/src/tipos/deporte';
import { Respuesta } from '@/src/tipos/api';

// Lista todos los deportes. Se usa para los filtros de espacios y el icono de cada tarjeta.
export function obtenerDeportes(): Promise<Respuesta<Deporte[]>> {
  return pedir<Deporte[]>({ method: 'GET', url: '/deportes' });
}
