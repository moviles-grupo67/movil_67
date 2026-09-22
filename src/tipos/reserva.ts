export type EstadoReserva = 'confirmada' | 'cancelada' | 'cumplida' | 'ausente';

export interface Reserva {
    id: string;
    turnoId: string;
    espacioId: string;
    usuarioId: string;
    cantidadPersonas: number;
    codigoQr: string;
    estado: EstadoReserva;
    ingresoEn: string | null;
    creadaEn: string;
    cancelableHasta: string;
}