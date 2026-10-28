import { validarIngreso } from '@/src/dominio/ingreso';
import { obtenerEspacioPorId } from '@/src/servicios/espacios';
import {
  actualizarReserva,
  obtenerReservaPorCodigo,
} from '@/src/servicios/reservas';
import { esError, Respuesta } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { Reserva } from '@/src/tipos/reserva';

const LATENCIA_MS = 400;
const esperar = () =>
  new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));

export const configMock = { simularErrorDeRed: false };

const fallo = (codigo: string, mensaje: string) => ({
  error: { codigo, mensaje },
});
const exito = <T>(datos: T) => ({ datos, meta: null });

const ERROR_DE_RED = () =>
  fallo('ERROR_DE_RED', 'No hay conexión. Probá de nuevo en un momento.');

export interface IngresoRegistrado {
  reserva: Reserva;
  espacio: Espacio;
}

export async function registrarIngreso(
  codigoQr: string,
  complejo: string,
): Promise<Respuesta<IngresoRegistrado>> {
  await esperar();
  if (configMock.simularErrorDeRed) return ERROR_DE_RED();

  const reserva = await obtenerReservaPorCodigo(codigoQr.trim());
  if (!reserva) {
    return fallo('CODIGO_DESCONOCIDO', 'No reconocemos este código.');
  }

  const respuestaEspacio = await obtenerEspacioPorId(reserva.espacioId);
  if (esError(respuestaEspacio)) return respuestaEspacio;
  const espacio = respuestaEspacio.datos;

  const ahora = new Date();
  const resultado = validarIngreso(reserva, espacio, complejo, ahora);
  if (!resultado.valido) {
    return fallo(resultado.codigo, resultado.mensaje);
  }

  const actualizada = await actualizarReserva(reserva.id, {
    estado: 'cumplida',
    ingresoEn: ahora.toISOString(),
  });
  if (!actualizada) {
    return fallo('NO_ENCONTRADO', 'No encontramos la reserva.');
  }
  return exito({ reserva: actualizada, espacio });
}
