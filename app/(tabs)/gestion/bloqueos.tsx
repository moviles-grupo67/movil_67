import { Boton } from '@/components/Boton';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { eliminarBloqueo, obtenerBloqueos } from '@/src/servicios/bloqueos';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Bloqueo } from '@/src/tipos/bloqueo';
import { Espacio } from '@/src/tipos/espacio';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet } from 'react-native';

export default function BloqueosScreen() {
  const tema = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Se ejecuta cada vez que la pantalla gana foco (al entrar y al volver).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  async function cargar() {
    setCargando(true);
    setError(null);
    const [rBloqueos, rEspacios] = await Promise.all([
      obtenerBloqueos(),
      obtenerEspacios(),
    ]);
    if (esError(rBloqueos)) setError(rBloqueos.error.mensaje);
    else if (esError(rEspacios)) setError(rEspacios.error.mensaje);
    else {
      setBloqueos(
        [...rBloqueos.datos].sort((a, b) => a.fecha.localeCompare(b.fecha)),
      );
      setEspacios(rEspacios.datos);
    }
    setCargando(false);
  }

  function nombreEspacio(id: string) {
    return espacios.find((e) => e.id === id)?.nombre ?? id;
  }

  function horario(b: Bloqueo) {
    return b.inicio === null || b.fin === null
      ? 'Todo el día'
      : `${b.inicio} a ${b.fin} hs`;
  }

  function pedirConfirmacion(b: Bloqueo) {
    Alert.alert(
      'Quitar bloqueo',
      `¿Querés quitar el bloqueo de ${nombreEspacio(b.espacioId)}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Quitar', style: 'destructive', onPress: () => quitar(b.id) },
      ],
    );
  }

  async function quitar(id: string) {
    const r = await eliminarBloqueo(id);
    if (esError(r)) Alert.alert('No se pudo quitar', r.error.mensaje);
    else setBloqueos((actuales) => actuales.filter((b) => b.id !== id));
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
      data={bloqueos}
      keyExtractor={(b) => b.id}
      contentContainerStyle={styles.lista}
      ListEmptyComponent={
        <Text style={styles.texto}>No hay bloqueos cargados.</Text>
      }
      ListHeaderComponent={
        <Boton
          titulo="Nuevo bloqueo"
          onPress={() => router.push('/gestion/bloqueo-nuevo')}
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
          ]}
        >
          <Text style={styles.titulo}>{nombreEspacio(item.espacioId)}</Text>
          <Text style={styles.texto}>
            {item.fecha} · {horario(item)}
          </Text>
          <Text style={styles.motivo}>{item.motivo}</Text>
          <Boton
            titulo="Quitar"
            variante="peligro"
            onPress={() => pedirConfirmacion(item)}
          />
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
  titulo: { fontSize: 16, fontWeight: '600' },
  texto: { fontSize: 14, opacity: 0.8, textAlign: 'center' },
  motivo: { fontSize: 15, marginBottom: 6 },
});
