export type Rol = "jugador" | "encargado" | "administrador";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: Rol;
  espaciosFavoritos: string[];
  cancelacionesTardias: number;
  ausencias: number;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  telefono: string;
  contrasena: string;
}
