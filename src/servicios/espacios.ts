import { pedir } from '@/src/servicios/cliente-api';
import { Respuesta } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';

export function obtenerEspacios(): Promise<Respuesta<Espacio[]>> {
  return pedir<Espacio[]>({ method: 'GET', url: '/espacios' });
}

export function obtenerEspacioPorId(id: string): Promise<Respuesta<Espacio>> {
  return pedir<Espacio>({ method: 'GET', url: `/espacios/${id}` });
}

export function actualizarPrecio(id: string, precioPorHora: number): Promise<Respuesta<Espacio>> {
  return pedir<Espacio>({
    method: 'PATCH',
    url: `/espacios/${id}`,
    data: { precioPorHora },
  });
}
