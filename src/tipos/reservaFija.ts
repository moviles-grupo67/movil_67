export type EstadoReservaFija =
  | "confirmada"
  | "cancelada"
  | "cumplida"
  | "ausente";

export interface Reserva {
  id: string;
  espacioId: string;
  titular: string; //No seria usuarioId?
  cantidadPersonas: number;
  codigoQr: string;
  estado: EstadoReservaFija;
  ingresoEn: string | null;
  creadaEn: string;
  cancelableHasta: string;
}
