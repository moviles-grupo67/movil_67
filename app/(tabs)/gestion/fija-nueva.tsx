import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { crearReservaFija } from '@/src/servicios/reservasFijas';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { ReservaFija } from '@/src/tipos/reservaFija';
import { fechaISO } from '@/src/utils/turnos';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function FijaNuevaScreen() {
  const router = useRouter();
  const tema = Colors[useColorScheme() ?? 'light'];

  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [espacioId, setEspacioId] = useState<string | null>(null);
  const [dia, setDia] = useState<number | null>(null);
  const [titular, setTitular] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [desde, setDesde] = useState(fechaISO(new Date()));
  const [hasta, setHasta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerEspacios().then((r) => {
      if (!esError(r)) setEspacios(r.datos);
    });
  }, []);

  async function guardar() {
    if (!espacioId || dia === null) {
      setError('Elegí un espacio y un día de la semana.');
      return;
    }
    setGuardando(true);
    setError(null);

    const respuesta = await crearReservaFija({
      espacioId,
      dia: dia as ReservaFija['dia'],
      titular,
      inicio,
      fin,
      desde,
      hasta: hasta.trim() === '' ? null : hasta,
    });

    setGuardando(false);
    if (esError(respuesta)) setError(respuesta.error.mensaje);
    else router.back();
  }

  function Chip({
    texto,
    elegido,
    onPress,
  }: {
    texto: string;
    elegido: boolean;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.chip,
          { backgroundColor: elegido ? tema.tint : tema.tint + '22' },
        ]}
      >
        <Text
          lightColor={elegido ? '#FFFFFF' : undefined}
          darkColor={elegido ? '#FFFFFF' : undefined}
        >
          {texto}
        </Text>
      </Pressable>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.etiqueta}>Espacio</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {espacios.map((e) => (
          <Chip
            key={e.id}
            texto={e.nombre}
            elegido={espacioId === e.id}
            onPress={() => setEspacioId(e.id)}
          />
        ))}
      </ScrollView>

      <Text style={styles.etiqueta}>Día de la semana</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {DIAS.map((nombre, i) => (
          <Chip
            key={nombre}
            texto={nombre}
            elegido={dia === i}
            onPress={() => setDia(i)}
          />
        ))}
      </ScrollView>

      <Text style={styles.etiqueta}>Titular</Text>
      <CampoTexto
        icono="usuario"
        value={titular}
        onChangeText={setTitular}
        placeholder="Grupo de los martes"
      />

      <Text style={styles.etiqueta}>Desde (HH:MM)</Text>
      <CampoTexto
        icono="calendario"
        value={inicio}
        onChangeText={setInicio}
        placeholder="21:00"
      />
      <Text style={styles.etiqueta}>Hasta (HH:MM)</Text>
      <CampoTexto
        icono="calendario"
        value={fin}
        onChangeText={setFin}
        placeholder="22:00"
      />

      <Text style={styles.etiqueta}>Vigente desde (AAAA-MM-DD)</Text>
      <CampoTexto
        icono="calendario"
        value={desde}
        onChangeText={setDesde}
        placeholder="2026-10-25"
      />
      <Text style={styles.etiqueta}>Vigente hasta (opcional)</Text>
      <CampoTexto
        icono="calendario"
        value={hasta}
        onChangeText={setHasta}
        placeholder="Vacío = sin fecha de fin"
      />

      {error && <Text style={styles.error}>{error}</Text>}
      <Boton
        titulo="Guardar reserva fija"
        onPress={guardar}
        cargando={guardando}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: 16, gap: 10 },
  etiqueta: { fontSize: 14, fontWeight: '600' },
  chips: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  error: { color: '#D32F2F', fontSize: 14, textAlign: 'center' },
});
