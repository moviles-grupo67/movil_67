export type Rol = "jugador" | "encargado" | "administrador";

export interface Usuario {
  id: string;
  nombre: string;
  nombreUsuario: string;
  rol: Rol;
  espaciosFavoritos: string[];
  cancelacionesTardias: number;
  ausencias: number;
}

// Falta email y num telefono?

export interface Sesion {
  token: string;
  usuario: Usuario;
}
