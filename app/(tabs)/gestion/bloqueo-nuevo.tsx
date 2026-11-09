import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { crearBloqueo } from '@/src/servicios/bloqueos';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { fechaISO } from '@/src/utils/turnos';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';

// Convierte el Alert (que funciona con callbacks) en algo que se puede "await".
function confirmar(titulo: string, mensaje: string): Promise<boolean> {
  return new Promise((resolver) => {
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
      {
        text: 'Bloquear igual',
        style: 'destructive',
        onPress: () => resolver(true),
      },
    ]);
  });
}

export default function BloqueoNuevoScreen() {
  const router = useRouter();
  const tema = Colors[useColorScheme() ?? 'light'];

  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [espacioId, setEspacioId] = useState<string | null>(null);
  const [fecha, setFecha] = useState(fechaISO(new Date()));
  const [todoElDia, setTodoElDia] = useState(true);
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerEspacios().then((r) => {
      if (!esError(r)) setEspacios(r.datos);
    });
  }, []);

  async function guardar() {
    if (!espacioId) {
      setError('Elegí un espacio.');
      return;
    }

    if (!fecha || !motivo.trim()) {
      setError('Completá la fecha y el motivo.');
      return;
    }

    if (!todoElDia && (!inicio || !fin || inicio >= fin)) {
      setError('Revisá el horario del bloqueo.');
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const datos = {
        espacioId,
        fecha,
        inicio: todoElDia ? null : inicio,
        fin: todoElDia ? null : fin,
        motivo: motivo.trim(),
      };

      const respuesta = await crearBloqueo(datos);

      if (esError(respuesta)) {
        setError(respuesta.error.mensaje);
        return;
      }

      Alert.alert(
        'Bloqueo creado',
        'El bloqueo se registró correctamente. Las reservas confirmadas que coincidan fueron gestionadas por el servidor.',
        [{ text: 'Aceptar', onPress: () => router.back() }],
      );
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Text style={styles.etiqueta}>Espacio</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {espacios.map((e) => {
          const elegido = espacioId === e.id;
          return (
            <Pressable
              key={e.id}
              onPress={() => setEspacioId(e.id)}
              style={[
                styles.chip,
                { backgroundColor: elegido ? tema.tint : tema.tint + '22' },
              ]}
            >
              <Text
                lightColor={elegido ? '#FFFFFF' : undefined}
                darkColor={elegido ? '#FFFFFF' : undefined}
              >
                {e.nombre}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.etiqueta}>Fecha (AAAA-MM-DD)</Text>
      <CampoTexto
        icono="calendario"
        value={fecha}
        onChangeText={setFecha}
        placeholder="2026-10-25"
      />

      <View style={styles.fila}>
        <Text style={styles.etiqueta}>Todo el día</Text>
        <Switch
          value={todoElDia}
          onValueChange={setTodoElDia}
          trackColor={{ true: tema.tint }}
        />
      </View>

      {!todoElDia && (
        <>
          <Text style={styles.etiqueta}>Desde (HH:MM)</Text>
          <CampoTexto
            icono="calendario"
            value={inicio}
            onChangeText={setInicio}
            placeholder="20:00"
          />
          <Text style={styles.etiqueta}>Hasta (HH:MM)</Text>
          <CampoTexto
            icono="calendario"
            value={fin}
            onChangeText={setFin}
            placeholder="21:00"
          />
        </>
      )}

      <Text style={styles.etiqueta}>Motivo</Text>
      <CampoTexto
        icono="alerta"
        value={motivo}
        onChangeText={setMotivo}
        placeholder="Cancha anegada por la lluvia"
      />

      {error && <Text style={styles.error}>{error}</Text>}
      <Boton titulo="Guardar bloqueo" onPress={guardar} cargando={guardando} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: 16, gap: 10 },
  etiqueta: { fontSize: 14, fontWeight: '600' },
  chips: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: { color: '#D32F2F', fontSize: 14, textAlign: 'center' },
});
