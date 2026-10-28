import { espacios as espaciosMock } from '@/src/mocks/espacios';
import { Respuesta } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';

// Simula la latencia de una llamada

const LATENCIA_MS = 400;
const esperar = () =>
  new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));

export const configMock = { simularErrorDeRed: false };

const fallo = (codigo: string, mensaje: string) => ({
  error: { codigo, mensaje },
});
const exito = <T>(datos: T) => ({ datos, meta: null });

export async function obtenerEspacios(): Promise<Respuesta<Espacio[]>> {
  await esperar();
  if (configMock.simularErrorDeRed) {
    return fallo(
      'ERROR_DE_RED',
      'No hay conexión. Probá de nuevo en un momento.',
    );
  }
  return exito(espaciosMock.filter((e) => e.activo));
}

export async function obtenerEspacioPorId(
  id: string,
): Promise<Respuesta<Espacio>> {
  await esperar();
  if (configMock.simularErrorDeRed) {
    return fallo(
      'ERROR_DE_RED',
      'No hay conexión. Probá de nuevo en un momento.',
    );
  }
  const encontrado = espaciosMock.find((e) => e.id === id);
  if (!encontrado) {
    return fallo('NO_ENCONTRADO', 'No encontramos ese espacio.');
  }
  return exito(encontrado);
}

// Actualiza el precio por hora de un espacio. Devuelve error si el precio es inválido o si no se encuentra el espacio.
export async function actualizarPrecio(
  id: string,
  precioPorHora: number,
): Promise<Respuesta<Espacio>> {
  await esperar();
  if (configMock.simularErrorDeRed) {
    return fallo(
      'ERROR_DE_RED',
      'No hay conexión. Probá de nuevo en un momento.',
    );
  }
  if (!Number.isFinite(precioPorHora) || precioPorHora <= 0) {
    return fallo(
      'PRECIO_INVALIDO',
      'El precio tiene que ser un número mayor a cero.',
    );
  }
  const espacio = espaciosMock.find((e) => e.id === id);
  if (!espacio) {
    return fallo('NO_ENCONTRADO', 'No encontramos ese espacio.');
  }
  espacio.precioPorHora = precioPorHora;
  return exito(espacio);
}
