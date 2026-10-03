import { usuariosMock, UsuarioMock } from '@/src/mocks/usuarios';
import { Respuesta } from '@/src/tipos/api';
import { Sesion, Usuario } from '@/src/tipos/usuario';

const LATENCIA_MS = 400;
const esperar = () => new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));

export const configMock = { simularErrorDeRed: false };

const fallo = (codigo: string, mensaje: string) => ({ error: { codigo, mensaje } });
const exito = <T>(datos: T) => ({ datos, meta: null });

const sinContrasena = ({ contrasena, ...usuario }: UsuarioMock): Usuario => usuario;

const tokenDe = (id: string) => `mock-token-${id}`;

export async function iniciarSesion(
  nombreUsuario: string,
  contrasena: string
): Promise<Respuesta<Sesion>> {
  await esperar();
  if (configMock.simularErrorDeRed) {
    return fallo('ERROR_DE_RED', 'No hay conexión. Probá de nuevo en un momento.');
  }

  const encontrado = usuariosMock.find(
    (u) => u.nombreUsuario === nombreUsuario.trim().toLowerCase() && u.contrasena === contrasena
  );
  if (!encontrado) {
    return fallo('CREDENCIALES_INVALIDAS', 'Usuario o contraseña incorrectos.');
  }
  return exito({ token: tokenDe(encontrado.id), usuario: sinContrasena(encontrado) });
}

export async function registrarse(
  nombre: string,
  nombreUsuario: string,
  contrasena: string
): Promise<Respuesta<Sesion>> {
  await esperar();
  if (configMock.simularErrorDeRed) {
    return fallo('ERROR_DE_RED', 'No hay conexión. Probá de nuevo en un momento.');
  }

  const usuario = nombreUsuario.trim().toLowerCase();
  if (nombre.trim().length < 2 || usuario.length < 3 || contrasena.length < 6) {
    return fallo(
      'DATOS_INVALIDOS',
      'Revisá los datos: nombre de 2+ letras, usuario de 3+ y contraseña de 6+ caracteres.'
    );
  }
  if (usuariosMock.some((u) => u.nombreUsuario === usuario)) {
    return fallo('USUARIO_EXISTENTE', 'Ese nombre de usuario ya está en uso.');
  }

  const nuevo: UsuarioMock = {
    id: `usr-${Date.now()}`,
    nombre: nombre.trim(),
    nombreUsuario: usuario,
    contrasena,
    rol: 'jugador',
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  };
  usuariosMock.push(nuevo);
  return exito({ token: tokenDe(nuevo.id), usuario: sinContrasena(nuevo) });
}

export async function obtenerSesionPorToken(token: string): Promise<Respuesta<Sesion>> {
  await esperar();
  if (configMock.simularErrorDeRed) {
    return fallo('ERROR_DE_RED', 'No hay conexión. Probá de nuevo en un momento.');
  }
  const encontrado = usuariosMock.find((u) => tokenDe(u.id) === token);
  if (!encontrado) {
    return fallo('TOKEN_INVALIDO', 'La sesión expiró. Ingresá de nuevo.');
  }
  return exito({ token, usuario: sinContrasena(encontrado) });
}
