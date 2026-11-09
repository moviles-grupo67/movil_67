import { pedir } from '@/src/servicios/cliente-api';
import { Respuesta } from '@/src/tipos/api';
import { Bloqueo } from '@/src/tipos/bloqueo';

export type NuevoBloqueo = Omit<Bloqueo, 'id'>;
// Obtiene bloqueos desde la API.
// La API permite filtrar por espacio y fecha desde la cual consultar.
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

// Crea un bloqueo.
// La API recibe espacioIds como array, aunque seleccionemos un solo espacio.
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

// Elimina un bloqueo.
// La API responde 204 sin contenido cuando la operación es exitosa.

export async function eliminarBloqueo(id: string): Promise<Respuesta<null>> {
  const respuesta = await pedir<null>({
    method: 'DELETE',
    url: `/bloqueos/${id}`,
  });

  // Si la respuesta es un objeto, conservamos su contenido.
  if (typeof respuesta === 'object' && respuesta !== null) {
    return respuesta;
  }

  // Si el servidor respondió sin contenido (204), devolvemos éxito.
  return {
    datos: null,
    meta: null,
  };
}
