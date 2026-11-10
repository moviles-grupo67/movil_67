import { pedir } from '@/src/servicios/cliente-api';
import { Respuesta } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';

// Lista completa de espacios. 
export function obtenerEspacios(): Promise<Respuesta<Espacio[]>> {
  return pedir<Espacio[]>({ method: 'GET', url: '/espacios' });
}

// Obtener un espacio en específico
export function obtenerEspacioPorId(id: string): Promise<Respuesta<Espacio>> {
  return pedir<Espacio>({ method: 'GET', url: `/espacios/${id}` });
}

// Solo permisos de administrador. Cambia nada más el precio (PATCH)
export function actualizarPrecio(id: string, precioPorHora: number): Promise<Respuesta<Espacio>> {
  return pedir<Espacio>({
    method: 'PATCH',
    url: `/espacios/${id}`,
    data: { precioPorHora },
  });
}
