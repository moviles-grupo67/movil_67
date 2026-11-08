import { isAxiosError } from 'axios';

import { RespuestaError } from '@/src/tipos/api';

export const ERROR_DE_RED: RespuestaError = {
  error: {
    codigo: 'ERROR_DE_RED',
    mensaje: 'No hay conexión. Probá de nuevo en un momento.',
  },
};

export function esCuerpoDeError(valor: unknown): valor is RespuestaError {
  if (typeof valor !== 'object' || valor === null || !('error' in valor)) return false;
  const cuerpo = valor.error;
  if (typeof cuerpo !== 'object' || cuerpo === null) return false;
  return (
    'codigo' in cuerpo &&
    'mensaje' in cuerpo &&
    typeof cuerpo.codigo === 'string' &&
    typeof cuerpo.mensaje === 'string'
  );
}

export function traducirError(error: unknown): RespuestaError {
  if (isAxiosError(error)) {
    if (esCuerpoDeError(error.response?.data)) return error.response.data;
    if (!error.response) return ERROR_DE_RED;
  }
  return {
    error: { codigo: 'ERROR_INESPERADO', mensaje: 'No se pudo completar el pedido.' },
  };
}
