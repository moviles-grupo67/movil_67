import { Usuario } from '@/src/tipos/usuario';

export interface UsuarioMock extends Usuario {
  contrasena: string;
}

export const usuariosMock: UsuarioMock[] = [
  {
    id: 'usr-207',
    nombre: 'Jugador de Prueba',
    email: 'emiliano@mail.com',
    telefono: '3455-401122',
    contrasena: 'villaguay2026',
    rol: 'jugador',
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  },
  {
    id: 'usr-310',
    nombre: 'Jugadora de Prueba',
    email: 'jugadora@mail.com',
    telefono: '3455-402233',
    contrasena: 'villaguay2026',
    rol: 'jugador',
    espaciosFavoritos: [],
    cancelacionesTardias: 3,
    ausencias: 2,
  },
  {
    id: 'usr-501',
    nombre: 'Encargado de Prueba',
    email: 'marcelo@villaguay.demo.ar',
    telefono: '3455-403344',
    contrasena: 'villaguay2026',
    rol: 'encargado',
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  },
  {
    id: 'usr-900',
    nombre: 'Administrador de Prueba',
    email: 'nahuel@villaguay.demo.ar',
    telefono: '3455-404455',
    contrasena: 'villaguay2026',
    rol: 'administrador',
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  },
];
