import { usuariosMock } from '@/src/mocks/usuarios'; // Luego cambiamos por la API real

export async function obtenerNombreUsuario(id: string): Promise<string> {
  return usuariosMock.find((u) => u.id === id)?.nombre ?? 'Usuario desconocido';
}

export async function alternarFavorito(usuarioId: string, espacioId: string): Promise<string[]> {
  const usuario = usuariosMock.find((u) => u.id === usuarioId);
  if (!usuario) return [];

  const yaEsFavorito = usuario.espaciosFavoritos.includes(espacioId);
  usuario.espaciosFavoritos = yaEsFavorito
    ? usuario.espaciosFavoritos.filter((id) => id !== espacioId)
    : [...usuario.espaciosFavoritos, espacioId];

  return usuario.espaciosFavoritos;
}