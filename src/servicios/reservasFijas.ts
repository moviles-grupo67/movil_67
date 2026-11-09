import { pedir } from '@/src/servicios/cliente-api';
import { Respuesta } from '@/src/tipos/api';
import { ReservaFija } from '@/src/tipos/reservaFija';

export type NuevaReservaFija = Omit<ReservaFija, 'id' | 'activa'>;

type CambiosReservaFija = Partial<Omit<NuevaReservaFija, 'espacioId'>>;

export function obtenerReservasFijas(): Promise<Respuesta<ReservaFija[]>> {
  return pedir<ReservaFija[]>({
    method: 'GET',
    url: '/fijas',
    params: { porPagina: 100 },
  });
}

export function crearReservaFija(
  datos: NuevaReservaFija,
): Promise<Respuesta<ReservaFija>> {
  return pedir<ReservaFija>({
    method: 'POST',
    url: '/fijas',
    data: datos,
  });
}

export function editarReservaFija(
  id: string,
  cambios: CambiosReservaFija,
): Promise<Respuesta<ReservaFija>> {
  return pedir<ReservaFija>({
    method: 'PATCH',
    url: `/fijas/${id}`,
    data: cambios,
  });
}

export async function desactivarReservaFija(
  id: string,
): Promise<Respuesta<null>> {
  const respuesta = await pedir<null>({
    method: 'DELETE',
    url: `/fijas/${id}`,
  });

  // DELETE responde 204: no devuelve contenido.
  if (typeof respuesta === 'object' && respuesta !== null) {
    return respuesta;
  }

  return {
    datos: null,
    meta: null,
  };
}
