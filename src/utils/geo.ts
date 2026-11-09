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

const RADIO_TIERRA_KM = 6371;

export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const radianes = (grados: number) => (grados * Math.PI) / 180;
  const dLat = radianes(b.latitud - a.latitud);
  const dLon = radianes(b.longitud - a.longitud);
  const lat1 = radianes(a.latitud);
  const lat2 = radianes(b.latitud);

  const sinoLat = Math.sin(dLat / 2);
  const sinoLon = Math.sin(dLon / 2);
  const h = sinoLat * sinoLat + Math.cos(lat1) * Math.cos(lat2) * sinoLon * sinoLon;

  return RADIO_TIERRA_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}