export type EstadoTurno = "confirmado" | "cancelado" | "cumplido" | "ausente";

export interface Turno {
  id: string;
  espacioId: string;
  fecha: string;
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  reservaID: string | null;
  motivoBloqueo: string | null;
  precio: number;
}
