import { pedir } from '@/src/servicios/cliente-api';
import { esError, Respuesta } from '@/src/tipos/api';
import { Reserva } from '@/src/tipos/reserva';

export interface MisReservas {
  proximas: Reserva[];
  pasadas: Reserva[];
}

export async function obtenerReservas(): Promise<Respuesta<MisReservas>> {
  const [proximas, pasadas] = await Promise.all([
    pedir<Reserva[]>({
      method: 'GET',
      url: '/yo/reservas',
      params: { cuando: 'proximas', porPagina: 100 },
    }),
    pedir<Reserva[]>({
      method: 'GET',
      url: '/yo/reservas',
      params: { cuando: 'pasadas', porPagina: 100 },
    }),
  ]);

  if (esError(proximas)) return proximas;
  if (esError(pasadas)) return pasadas;

  return {
    datos: { proximas: proximas.datos, pasadas: pasadas.datos },
    meta: null,
  };
}

export function obtenerReservaPorId(id: string): Promise<Respuesta<Reserva>> {
  return pedir<Reserva>({ method: 'GET', url: `/reservas/${id}` });
}

export function cancelarReserva(id: string): Promise<Respuesta<Reserva>> {
  return pedir<Reserva>({ method: 'POST', url: `/reservas/${id}/cancelacion` });
}

export function crearReserva(datos: {
  turnoId: string;
  cantidadPersonas: number;
}): Promise<Respuesta<Reserva>> {
  return pedir<Reserva>({
    method: 'POST',
    url: '/reservas',
    data: datos,
  });
}

export function marcarAusente(id: string): Promise<Respuesta<Reserva>> {
  return pedir<Reserva>({
    method: 'POST',
    url: `/reservas/${id}/ausente`,
    data: {},
  });
}