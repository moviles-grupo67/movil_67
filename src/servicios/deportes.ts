import { deportes as deportesMock } from '@/src/mocks/deportes';
import { Deporte } from '@/src/tipos/deporte';
import { Respuesta } from '@/src/tipos/api';

const LATENCIA_MS = 400;
const esperar = () => new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));

const exito = <T>(datos: T) => ({ datos, meta: null });

export async function obtenerDeportes(): Promise<Respuesta<Deporte[]>> {
  await esperar();
  return exito(deportesMock);
}