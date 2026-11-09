import { reservas as reservasMock } from '@/src/mocks/reservas';
import { pedir } from '@/src/servicios/cliente-api';
import { esError, Respuesta } from '@/src/tipos/api';
import { Reserva } from '@/src/tipos/reserva';
import { fechaISO, inicioDeTurno } from '@/src/utils/turnos';

let reservas: Reserva[] = [...reservasMock];

export async function obtenerReservas(_usuarioId: string): Promise<Reserva[]> {
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
  return [
    ...(esError(proximas) ? [] : proximas.datos),
    ...(esError(pasadas) ? [] : pasadas.datos),
  ];
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

export async function cancelarPorBloqueo(id: string): Promise<void> {
  reservas = reservas.map((r) =>
    r.id === id ? { ...r, estado: 'cancelada' } : r,
  );
}

export async function registrarIngreso(
  codigoQr: string,
  espacioId: string,
): Promise<Reserva> {
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

export async function obtenerReservaPorCodigo(
  codigoQr: string,
): Promise<Reserva | undefined> {
  return reservas.find((r) => r.codigoQr === codigoQr);
}

export async function actualizarReserva(
  id: string,
  cambios: Partial<Pick<Reserva, 'estado' | 'ingresoEn'>>,
): Promise<Reserva | undefined> {
  const actual = reservas.find((r) => r.id === id);
  if (!actual) return undefined;

  const actualizada = { ...actual, ...cambios };
  reservas = reservas.map((r) => (r.id === id ? actualizada : r));
  return actualizada;
}

export interface ReservaAfectada {
  reserva: Reserva;
  nombreUsuario: string;
  hora: string;
}

export function marcarAusente(id: string): Promise<Respuesta<Reserva>> {
  return pedir<Reserva>({
    method: 'POST',
    url: `/reservas/${id}/ausente`,
    data: {},
  });
}
