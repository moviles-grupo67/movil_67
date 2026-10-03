export interface Meta {
  total: number;
  pagina: number;
  porPagina: number;
}

export interface RespuestaExito<T> {
  datos: T;
  meta: Meta | null;
}

export interface RespuestaError {
  error: { codigo: string; mensaje: string };
}

export type Respuesta<T> = RespuestaExito<T> | RespuestaError;

export function esError<T>(r: Respuesta<T>): r is RespuestaError {
  return 'error' in r;
}
