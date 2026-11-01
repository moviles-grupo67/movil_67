import { usuariosMock } from '@/src/mocks/usuarios'; // Luego cambiamos por la API real

export async function obtenerNombreUsuario(id: string): Promise<string> {
  return usuariosMock.find((u) => u.id === id)?.nombre ?? 'Usuario desconocido';
}
