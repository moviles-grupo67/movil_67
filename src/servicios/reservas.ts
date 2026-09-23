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