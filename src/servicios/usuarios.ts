import { pedir } from '@/src/servicios/cliente-api';
import { esError } from '@/src/tipos/api';
import { Usuario } from '@/src/tipos/usuario';

export async function obtenerNombreUsuario(id: string): Promise<string> {
  const respuesta = await pedir<Usuario>({ method: 'GET', url: `/usuarios/${id}` });
  return esError(respuesta) ? 'Usuario desconocido' : respuesta.datos.nombre;
}

export async function alternarFavorito(
  espacioId: string,
  favoritosActuales: string[],
): Promise<string[]> {
  const yaEsFavorito = favoritosActuales.includes(espacioId);

  if (yaEsFavorito) {
    const respuesta = await pedir<void>({
      method: 'DELETE',
      url: `/yo/espacios-favoritos/${espacioId}`,
    });
    return esError(respuesta) ? favoritosActuales : favoritosActuales.filter((id) => id !== espacioId);
  }

  const respuesta = await pedir<Usuario>({
    method: 'PUT',
    url: `/yo/espacios-favoritos/${espacioId}`,
  });
  return esError(respuesta) ? favoritosActuales : respuesta.datos.espaciosFavoritos;
}
