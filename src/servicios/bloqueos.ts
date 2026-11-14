import { pedir } from '@/src/servicios/cliente-api';
import { Respuesta } from '@/src/tipos/api';
import { Bloqueo } from '@/src/tipos/bloqueo';

export type NuevoBloqueo = Omit<Bloqueo, 'id'>;

export function obtenerBloqueos(filtro?: {
  espacioId?: string;
  desde?: string;
}): Promise<Respuesta<Bloqueo[]>> {
  return pedir<Bloqueo[]>({
    method: 'GET',
    url: '/bloqueos',
    params: { ...filtro, porPagina: 100 },
  });
}

export function crearBloqueo(
  datos: NuevoBloqueo,
): Promise<Respuesta<Bloqueo[]>> {
  const { espacioId, fecha, inicio, fin, motivo } = datos;

  return pedir<Bloqueo[]>({
    method: 'POST',
    url: '/bloqueos',
    data: {
      espacioIds: [espacioId],
      fecha,
      ...(inicio !== null && fin !== null ? { inicio, fin } : {}),
      motivo,
    },
  });
}

export async function eliminarBloqueo(id: string): Promise<Respuesta<null>> {
  const respuesta = await pedir<null>({
    method: 'DELETE',
    url: `/bloqueos/${id}`,
  });

  if (typeof respuesta === 'object' && respuesta !== null) {
    return respuesta;
  }

  return {
    datos: null,
    meta: null,
  };
}
