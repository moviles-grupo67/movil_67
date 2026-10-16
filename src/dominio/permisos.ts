import { Rol } from "@/src/tipos/usuario";

export function esStaff(rol: Rol | null | undefined): boolean {
  return rol === "encargado" || rol === "administrador";
}
