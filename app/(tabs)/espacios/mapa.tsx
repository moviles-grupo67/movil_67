import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Icono } from '@/components/Icono';

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
  const mapRef = useRef<MapView>(null);
  useEffect(() => {
    obtenerEspacios().then((resultado) => {
      if (!esError(resultado)) {
        setEspacios(resultado.datos);
      }
    });
  }, []);

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

  return (
    <View style={styles.contenedor}>
      <MapView ref={mapRef} style={styles.mapa} initialRegion={REGION_VILLAGUAY}>
        {complejos.map((complejo) => (
          <Marker
            key={complejo.nombre}
            coordinate={{ latitude: complejo.latitud, longitude: complejo.longitud }}
            title={complejo.nombre}
            description={`${complejo.cantidadEspacios} espacio${complejo.cantidadEspacios > 1 ? 's' : ''}`}
          />
        ))}
        {miUbicacion && (
          <Marker
            coordinate={{ latitude: miUbicacion.latitud, longitude: miUbicacion.longitud }}
            title="Tu ubicación"
            pinColor={tema.tint}
          />
        )}
      </MapView>

      <Pressable
        style={[styles.botonUbicacion, { backgroundColor: tema.surface }]}
        onPress={buscarMiUbicacion}>
        <Icono nombre="ubicacion" color={tema.tint} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  mapa: { flex: 1 },
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