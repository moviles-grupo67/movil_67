import { Usuario } from '@/src/tipos/usuario';

export interface UsuarioMock extends Usuario {
  contrasena: string;
}

export const usuariosMock: UsuarioMock[] = [
  {
    id: 'usr-207',
    nombre: 'Jugador de Prueba',
    nombreUsuario: 'jugador',
    contrasena: '123456',
    rol: 'jugador',
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  },
  {
    id: 'usr-310',
    nombre: 'Jugadora de Prueba',
    nombreUsuario: 'jugadora',
    contrasena: '123456',
    rol: 'jugador',
    espaciosFavoritos: [],
    cancelacionesTardias: 3,
    ausencias: 2,
  },
  {
    id: 'usr-501',
    nombre: 'Encargado de Prueba',
    nombreUsuario: 'encargado',
    contrasena: '123456',
    rol: 'encargado',
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  },
  {
    id: 'usr-900',
    nombre: 'Administrador de Prueba',
    nombreUsuario: 'admin',
    contrasena: '123456',
    rol: 'administrador',
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  },
];
