import { Coordenadas } from '@/src/tipos/espacio';

export interface RegionMapa {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export function regionParaCoordenadas(puntos: Coordenadas[]): RegionMapa | null {
  if (puntos.length === 0) return null;

  let latMin = puntos[0].latitud;
  let latMax = puntos[0].latitud;
  let lonMin = puntos[0].longitud;
  let lonMax = puntos[0].longitud;

  for (const punto of puntos) {
    latMin = Math.min(latMin, punto.latitud);
    latMax = Math.max(latMax, punto.latitud);
    lonMin = Math.min(lonMin, punto.longitud);
    lonMax = Math.max(lonMax, punto.longitud);
  }

  return {
    latitude: (latMin + latMax) / 2,
    longitude: (lonMin + lonMax) / 2,
    latitudeDelta: Math.max((latMax - latMin) * 1.4, 0.008),
    longitudeDelta: Math.max((lonMax - lonMin) * 1.4, 0.008),
  };
}