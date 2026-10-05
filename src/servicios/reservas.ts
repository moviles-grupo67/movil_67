import { reservas as reservasMock } from '@/src/mocks/reservas';
import { Reserva } from '@/src/tipos/reserva';

let reservas: Reserva[] = [...reservasMock];

export async function obtenerReservas(usuarioId: string): Promise<Reserva[]> {
    return reservas.filter((r) => r.usuarioId === usuarioId);
}

export async function obtenerReservaPorId(id: string): Promise<Reserva | undefined> {
    return reservas.find((r) => r.id === id);
}

export async function obtenerTurnosOcupados(espacioId: string): Promise<string[]> {
    return reservas
        .filter((r) => r.espacioId === espacioId && r.estado === 'confirmada')
        .map((r) => r.turnoId);
}

export async function cancelarReserva(id: string): Promise<void> {
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) {
        throw new Error('No encontramos esa reserva.');
    }

    if (new Date() > new Date(reserva.cancelableHasta)) {
        throw new Error('Faltan menos de 4 horas para el turno. Para cancelar, avisá a la Dirección de Deportes.');
    }

    reservas = reservas.map((r) =>
        r.id === id ? { ...r, estado: 'cancelada' } : r
    );
}

export async function crearReserva(datos: {
    espacioId: string;
    turnoId: string;
    usuarioId: string;
    cantidadPersonas: number
}): Promise<Reserva> {

    const activas = reservas.filter(
        (r) => r.usuarioId === datos.usuarioId && r.estado === 'confirmada'
    );

    if (activas.length >= 3) {
        throw new Error('Ya tenés 3 reservas activas. Cancelá alguna para reservar otra.');
    }

    //La cancelacion de la reserva siempre se hace desde hoy porque aun no agregamos nada de fechas
    const [hora] = datos.turnoId.split(':');
    const inicioTurno = new Date();
    inicioTurno.setHours(Number(hora), 0, 0, 0);

    const cuatroHoras = 1000 * 60 * 60 * 4;
    const cancelableHasta = new Date(inicioTurno.getTime() - cuatroHoras);

    const nueva: Reserva = {
        id: `res-${Date.now()}`,
        turnoId: datos.turnoId,
        espacioId: datos.espacioId,
        usuarioId: datos.usuarioId,
        cantidadPersonas: datos.cantidadPersonas,
        codigoQr: `QR-${Date.now()}`,
        estado: 'confirmada',
        ingresoEn: null,
        creadaEn: new Date().toISOString(),
        cancelableHasta: cancelableHasta.toISOString(),
    };
    reservas = [...reservas, nueva];
    return nueva;
}