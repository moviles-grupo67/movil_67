import { Boton } from '@/components/Boton';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { obtenerEspacios } from '@/src/servicios/espacios';
import {
  desactivarReservaFija,
  obtenerReservasFijas,
} from '@/src/servicios/reservasFijas';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { ReservaFija } from '@/src/tipos/reservaFija';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet } from 'react-native';

// El índice coincide con el campo "dia" del tipo: 0 = domingo.
const DIAS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export default function FijasScreen() {
  const tema = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const [fijas, setFijas] = useState<ReservaFija[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  async function cargar() {
    setCargando(true);
    setError(null);
    const [rFijas, rEspacios] = await Promise.all([
      obtenerReservasFijas(),
      obtenerEspacios(),
    ]);
    if (esError(rFijas)) setError(rFijas.error.mensaje);
    else if (esError(rEspacios)) setError(rEspacios.error.mensaje);
    else {
      setFijas(rFijas.datos);
      setEspacios(rEspacios.datos);
    }
    setCargando(false);
  }

  function nombreEspacio(id: string) {
    return espacios.find((e) => e.id === id)?.nombre ?? id;
  }

  function vigencia(f: ReservaFija) {
    return f.hasta
      ? `Del ${f.desde} al ${f.hasta}`
      : `Desde el ${f.desde}, sin fecha de fin`;
  }

  function pedirConfirmacion(f: ReservaFija) {
    Alert.alert(
      'Desactivar reserva fija',
      `¿Desactivar la fija de "${f.titular}"? El turno va a quedar libre.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => desactivar(f.id),
        },
      ],
    );
  }

  async function desactivar(id: string) {
    const r = await desactivarReservaFija(id);
    if (esError(r)) Alert.alert('No se pudo desactivar', r.error.mensaje);
    else
      setFijas((actuales) =>
        actuales.map((f) => (f.id === id ? { ...r.datos } : f)),
      );
  }

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={tema.tint} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>{error}</Text>
        <Boton titulo="Reintentar" onPress={cargar} />
      </View>
    );
  }

  return (
    <FlatList
      data={fijas}
      keyExtractor={(f) => f.id}
      contentContainerStyle={styles.lista}
      ListEmptyComponent={
        <Text style={styles.texto}>No hay reservas fijas cargadas.</Text>
      }
      ListHeaderComponent={
        <Boton
          titulo="Nueva reserva fija"
          onPress={() => router.push('/gestion/fija-nueva')}
        />
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.tarjeta,
            {
              backgroundColor: tema.surface,
              borderColor: tema.tabIconDefault + '33',
            },
            !item.activa && styles.inactiva,
          ]}
        >
          <Text style={styles.titulo}>{item.titular}</Text>
          <Text style={styles.texto}>{nombreEspacio(item.espacioId)}</Text>
          <Text style={styles.texto}>
            Todos los {DIAS[item.dia].toLowerCase()}s · {item.inicio} a{' '}
            {item.fin} hs
          </Text>
          <Text style={styles.texto}>{vigencia(item)}</Text>
          {item.activa ? (
            <Boton
              titulo="Desactivar"
              variante="peligro"
              onPress={() => pedirConfirmacion(item)}
            />
          ) : (
            <Text style={styles.etiquetaInactiva}>Desactivada</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  inactiva: { opacity: 0.55 },
  titulo: { fontSize: 16, fontWeight: '600' },
  texto: { fontSize: 14, opacity: 0.8 },
  etiquetaInactiva: { fontSize: 14, fontWeight: '600', marginTop: 4 },
});
