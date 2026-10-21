import { reservas as reservasMock } from '@/src/mocks/reservas';
import { Reserva } from '@/src/tipos/reserva';
import { inicioDeTurno, CUATRO_HORAS, fechaISO } from '@/src/utils/turnos';
import { bloqueos } from '@/src/mocks/bloqueos';
import { reservasFijas } from '@/src/mocks/reservasFijas';
import { estaBloqueado, esFijo } from '@/src/utils/disponibilidad';

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

    const inicioTurno = inicioDeTurno(datos.turnoId);

    if (inicioTurno.getTime() <= Date.now()) {
        throw new Error('Ese turno ya pasó. Elegí otro horario.');
    }

    const hora = inicioTurno.getHours();

    if (estaBloqueado(bloqueos, datos.espacioId, inicioTurno, hora)) {
        throw new Error('Ese espacio está cerrado en ese horario. Elegí otro turno.');
    }
    if (esFijo(reservasFijas, datos.espacioId, inicioTurno, hora)) {
        throw new Error('Ese turno es de una reserva fija. Elegí otro horario.');
    }
    if (reservas.some((r) => r.turnoId === datos.turnoId && r.estado === 'confirmada')) {
        throw new Error('Ese turno ya está reservado. Elegí otro.');
    }

    const cancelableHasta = new Date(inicioTurno.getTime() - CUATRO_HORAS);

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

export async function registrarIngreso(codigoQr: string, espacioId: string): Promise<Reserva> {
    const reserva = reservas.find((r) => r.codigoQr === codigoQr);

    if (!reserva) {
        throw new Error('Ese QR no es de ninguna reserva.');
    }
    if (reserva.estado !== 'confirmada') {
        throw new Error(`Esta reserva ya no es válida (${reserva.estado}).`);
    }
    if (reserva.espacioId !== espacioId) {
        throw new Error('Esta reserva es de otra cancha.');
    }
    if (fechaISO(inicioDeTurno(reserva.turnoId)) !== fechaISO(new Date())) {
        throw new Error('Esta reserva no es de hoy.');
    }

    const actualizada: Reserva = {
        ...reserva,
        estado: 'cumplida',
        ingresoEn: new Date().toISOString(),
    };
    reservas = reservas.map((r) => (r.id === reserva.id ? actualizada : r));
    return actualizada;
}