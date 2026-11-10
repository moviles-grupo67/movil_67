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

export async function obtenerReservaPorId(
  id: string,
): Promise<Reserva | undefined> {
  const respuesta = await pedir<Reserva>({
    method: 'GET',
    url: `/reservas/${id}`,
  });
  return esError(respuesta) ? undefined : respuesta.datos;
}

export async function cancelarReserva(id: string): Promise<void> {
  const respuesta = await pedir<Reserva>({
    method: 'POST',
    url: `/reservas/${id}/cancelacion`,
  });
  if (esError(respuesta)) throw new Error(respuesta.error.mensaje);
}

export async function crearReserva(datos: {
  espacioId: string;
  turnoId: string;
  usuarioId: string;
  cantidadPersonas: number;
}): Promise<Reserva> {
  const respuesta = await pedir<Reserva>({
    method: 'POST',
    url: '/reservas',
    data: { turnoId: datos.turnoId, cantidadPersonas: datos.cantidadPersonas },
  });
  if (esError(respuesta)) throw new Error(respuesta.error.mensaje);
  return respuesta.datos;
}

export function marcarAusente(id: string): Promise<Respuesta<Reserva>> {
  return pedir<Reserva>({
    method: 'POST',
    url: `/reservas/${id}/ausente`,
    data: {},
  });
}