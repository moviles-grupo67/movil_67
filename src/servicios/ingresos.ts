import { pedir } from '@/src/servicios/cliente-api';
import { esError, Respuesta } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { Reserva } from '@/src/tipos/reserva';

export interface IngresoRegistrado {
  reserva: Reserva;
  espacio: Espacio;
}

export async function registrarIngreso(
  codigoQr: string,
  espacio: Espacio,
): Promise<Respuesta<IngresoRegistrado>> {
  const respuesta = await pedir<Reserva>({
    method: 'POST',
    url: '/ingresos',
    data: { codigoQr: codigoQr.trim(), espacioId: espacio.id },
  });

  if (esError(respuesta)) return respuesta;

  // La API devuelve solo la reserva; el espacio ya lo tenemos elegido.
  return { datos: { reserva: respuesta.datos, espacio }, meta: null };
}
