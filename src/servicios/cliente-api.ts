import { AxiosRequestConfig, create } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { traducirError } from '@/src/servicios/errores-api';
import { Respuesta } from '@/src/tipos/api';

export const CLAVE_TOKEN = 'sesion-token';

const URL_BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

export const clienteApi = create({
  baseURL: URL_BASE,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

clienteApi.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(CLAVE_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function pedir<T>(config: AxiosRequestConfig): Promise<Respuesta<T>> {
  if (!URL_BASE) {
    return {
      error: {
        codigo: 'API_SIN_CONFIGURAR',
        mensaje: 'Falta EXPO_PUBLIC_API_URL en el archivo .env.local.',
      },
    };
  }
  try {
    const respuesta = await clienteApi.request<Respuesta<T>>(config);
    return respuesta.data;
  } catch (error) {
    return traducirError(error);
  }
}
