import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { Text } from '@/components/Themed';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Icono } from '@/components/Icono';
import { Boton } from '@/components/Boton';
import { regionParaCoordenadas, distanciaKm } from '@/src/utils/geo';

const REGION_VILLAGUAY = {
  latitude: -31.8581,
  longitude: -59.0258,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface Complejo {
  nombre: string;
  latitud: number;
  longitud: number;
  cantidadEspacios: number;
}

export default function MapaScreen() {
  const tema = Colors[useColorScheme() ?? 'light'];
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [miUbicacion, setMiUbicacion] = useState<{ latitud: number; longitud: number } | null>(null);
  const [complejoSeleccionado, setComplejoSeleccionado] = useState<Complejo | null>(null);
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  useEffect(() => {
    obtenerEspacios().then((resultado) => {
      if (!esError(resultado)) {
        setEspacios(resultado.datos);
      }
    });
  }, []);

  useEffect(() => {
    if (espacios.length === 0) return;
    const region = regionParaCoordenadas(espacios.map((e) => e.coordenadas));
    if (region) {
      mapRef.current?.animateToRegion(region, 1000);
    }
  }, [espacios]);

  // Agrupa los espacios por complejo
  const complejos = Object.values(
    espacios.reduce((acc, espacio) => {
      if (!acc[espacio.complejo]) {
        acc[espacio.complejo] = {
          nombre: espacio.complejo,
          latitud: espacio.coordenadas.latitud,
          longitud: espacio.coordenadas.longitud,
          cantidadEspacios: 0,
        };
      }
      acc[espacio.complejo].cantidadEspacios += 1;
      return acc;
    }, {} as Record<string, Complejo>)
  );

  // Pide permiso de ubicación y centra el mapa en la posición actual del usuario.
  async function buscarMiUbicacion() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('Estado del permiso de ubicación:', status);
    if (status !== 'granted') return;

    try {
      const ultima = await Location.getLastKnownPositionAsync();
      if (ultima) {
        setMiUbicacion({ latitud: ultima.coords.latitude, longitud: ultima.coords.longitude });
        mapRef.current?.animateToRegion({
          latitude: ultima.coords.latitude,
          longitude: ultima.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

      const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMiUbicacion({ latitud: actual.coords.latitude, longitud: actual.coords.longitude });
      mapRef.current?.animateToRegion({
        latitude: actual.coords.latitude,
        longitude: actual.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } catch (error) {
      console.log('No se pudo obtener la ubicación:', error);
    }
  }

  // Agrega la distancia en km una vez que ya sabemos dónde está el usuario.
  function descripcionDe(complejo: Complejo): string {
    const espacios = `${complejo.cantidadEspacios} espacio${complejo.cantidadEspacios > 1 ? 's' : ''}`;
    if (!miUbicacion) return espacios;
    const km = distanciaKm(miUbicacion, { latitud: complejo.latitud, longitud: complejo.longitud });
    return `${espacios} · ${km.toFixed(1)} km`;
  }

  // Abre Google Maps con la ruta hasta ese complejo.
  function abrirComoLlegar(complejo: Complejo) {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${complejo.latitud},${complejo.longitud}`);
  }

  // Lleva a la lista de espacios con el filtro de este complejo ya aplicado.
  function irAReservar(complejo: Complejo) {
    router.push({ pathname: '/espacios', params: { complejo: complejo.nombre } });
  }

  return (
    <View style={styles.contenedor}>
      <MapView
        ref={mapRef}
        style={styles.mapa}
        initialRegion={REGION_VILLAGUAY}
        onPress={() => setComplejoSeleccionado(null)}>
        {complejos.map((complejo) => (
          <Marker
            key={complejo.nombre}
            coordinate={{ latitude: complejo.latitud, longitude: complejo.longitud }}
            pinColor={tema.tint}
            onPress={() => setComplejoSeleccionado(complejo)}
          />
        ))}
        {miUbicacion && (
          <Marker
            coordinate={{ latitude: miUbicacion.latitud, longitude: miUbicacion.longitud }}
            title="Tu ubicación"
            pinColor={"#1E88E5"}
          />
        )}
      </MapView>

      {complejoSeleccionado && (
        <View style={[styles.tarjeta, { backgroundColor: tema.surface }]}>
          <Text style={styles.tituloTarjeta}>{complejoSeleccionado.nombre}</Text>
          <Text>{descripcionDe(complejoSeleccionado)}</Text>
          <View style={styles.accionesTarjeta}>
            <Boton titulo="Cómo llegar" variante="secundario" onPress={() => abrirComoLlegar(complejoSeleccionado)} />
            <Boton titulo="Ver espacios" onPress={() => irAReservar(complejoSeleccionado)} />
          </View>
        </View>
      )}


      <TouchableOpacity
        style={[styles.botonUbicacion, { backgroundColor: tema.surface }]}
        activeOpacity={0.7}
        onPress={buscarMiUbicacion}>
        <Icono nombre="ubicacion" color={tema.tint} size={22} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  mapa: { flex: 1 },
  tarjeta: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 84,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tituloTarjeta: { fontSize: 15, fontWeight: 'bold' },
  accionesTarjeta: { gap: 8, marginTop: 8 },
  botonUbicacion: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
