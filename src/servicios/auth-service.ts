import { pedir } from '@/src/servicios/cliente-api';
import { esError, Respuesta } from '@/src/tipos/api';
import { DatosRegistro, Sesion, Usuario } from '@/src/tipos/usuario';

export function iniciarSesion(email: string, contrasena: string): Promise<Respuesta<Sesion>> {
  return pedir<Sesion>({
    method: 'POST',
    url: '/auth/ingreso',
    data: { email: email.trim(), contrasena },
  });
}

export function registrarse(datos: DatosRegistro): Promise<Respuesta<Sesion>> {
  return pedir<Sesion>({
    method: 'POST',
    url: '/auth/registro',
    data: {
      nombre: datos.nombre.trim(),
      email: datos.email.trim(),
      telefono: datos.telefono.trim(),
      contrasena: datos.contrasena,
    },
  });
}

export async function obtenerSesionPorToken(token: string): Promise<Respuesta<Sesion>> {
  const respuesta = await pedir<Usuario>({ method: 'GET', url: '/yo' });
  if (esError(respuesta)) {
    if (respuesta.error.codigo === 'NO_AUTENTICADO') {
      return {
        error: { codigo: 'TOKEN_INVALIDO', mensaje: 'La sesión expiró. Ingresá de nuevo.' },
      };
    }
    return respuesta;
  }
  return { datos: { token, usuario: respuesta.datos }, meta: null };
}
