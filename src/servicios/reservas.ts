import { Reserva } from '@/src/tipos/reserva';
import { reservas as reservasMock } from '@/src/mocks/reservas';

let reservas: Reserva[] = [...reservasMock];

export async function obtenerReservas(): Promise<Reserva[]> {
    return reservas;
}

export async function cancelarReserva(id: string): Promise<void> {
    reservas = reservas.map((r) => 
        r.id === id ? {...r, estado: 'cancelada' } : r
    );
}

export async function crearReserva(datos: {
    espacioId: string;
    turnoId: string;
    cantidadPersonas: number
}): Promise<Reserva> {
    const nueva: Reserva = {
        id: `res-${Date.now()}`,
        turnoId: datos.turnoId,
        espacioId: datos.espacioId,
        usuarioId: 'usr-207',
        cantidadPersonas: datos.cantidadPersonas,
        codigoQr: `QR-${Date.now()}`,
        estado: 'confirmada',
        ingresoEn: null,
        creadaEn: new Date().toISOString(),
        cancelableHasta: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    };
    reservas = [...reservas, nueva];
    return nueva;
}