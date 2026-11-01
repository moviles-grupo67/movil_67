import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { actualizarPrecio, obtenerEspacios } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

function FilaPrecio({ espacio }: { espacio: Espacio }) {
  const tema = Colors[useColorScheme() ?? 'light'];
  const [texto, setTexto] = useState(String(espacio.precioPorHora));
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    const r = await actualizarPrecio(espacio.id, Number(texto));
    setGuardando(false);
    setFallo(esError(r));
    setMensaje(esError(r) ? r.error.mensaje : 'Precio actualizado.');
  }

  return (
    <View
      style={[
        styles.tarjeta,
        {
          backgroundColor: tema.surface,
          borderColor: tema.tabIconDefault + '33',
        },
      ]}
    >
      <Text style={styles.titulo}>{espacio.nombre}</Text>
      <Text style={styles.sub}>{espacio.complejo}</Text>
      <CampoTexto
        icono="llave"
        value={texto}
        onChangeText={setTexto}
        keyboardType="numeric"
        placeholder="Precio por hora"
      />
      {mensaje && (
        <Text style={[styles.sub, fallo && styles.error]}>{mensaje}</Text>
      )}
      <Boton titulo="Guardar precio" onPress={guardar} cargando={guardando} />
    </View>
  );
}

export default function PreciosScreen() {
  const tema = Colors[useColorScheme() ?? 'light'];
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerEspacios().then((r) => {
      if (esError(r)) setError(r.error.mensaje);
      else setEspacios(r.datos);
      setCargando(false);
    });
  }, []);

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
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={espacios}
      keyExtractor={(e) => e.id}
      contentContainerStyle={styles.lista}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => <FilaPrecio espacio={item} />}
    />
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 8 },
  titulo: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 14, opacity: 0.8 },
  error: { color: '#D32F2F', opacity: 1 },
});
