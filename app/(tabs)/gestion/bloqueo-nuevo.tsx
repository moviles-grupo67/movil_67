import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/auth-context';
import { crearBloqueo } from '@/src/servicios/bloqueos';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { obtenerReservasAfectadas } from '@/src/servicios/reservas';
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
  const { sesion } = useAuth();

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
    if (!espacioId || !sesion) {
      setError('Elegí un espacio.');
      return;
    }
    setGuardando(true);
    setError(null);

    const datos = {
      espacioId,
      fecha,
      inicio: todoElDia ? null : inicio,
      fin: todoElDia ? null : fin,
      motivo,
    };

    const afectadas = await obtenerReservasAfectadas(datos);
    if (afectadas.length > 0) {
      const lineas = afectadas
        .slice(0, 5)
        .map(
          (a) =>
            `• ${a.hora} · ${a.nombreUsuario} · ${a.reserva.cantidadPersonas} pers.`,
        );
      if (afectadas.length > 5) lineas.push(`y ${afectadas.length - 5} más`);

      const sigue = await confirmar(
        `Reservas afectadas (${afectadas.length})`,
        `${lineas.join('\n')}\n\nLas siguientes reservas seran canceladas.`,
      );
      if (!sigue) {
        setGuardando(false);
        return;
      }
    }

    const respuesta = await crearBloqueo(datos, sesion.usuario.id);

    setGuardando(false);
    if (esError(respuesta)) setError(respuesta.error.mensaje);
    else router.back();
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
