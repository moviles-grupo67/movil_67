import { Boton } from '@/components/Boton';
import { Text, View } from '@/components/Themed';
import { autenticar, biometriaDisponible } from '@/src/servicios/biometria';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { registrarIngreso } from '@/src/servicios/reservas';
import { vibrarError, vibrarExito } from '@/src/servicios/vibracion';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { textoTurno } from '@/src/utils/turnos';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

export default function EscanerScreen() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [verificado, setVerificado] = useState(false);

  async function verificar() {
    if (!(await biometriaDisponible())) {
      setVerificado(true);
      return;
    }
    setVerificado(await autenticar('Confirmá que sos el encargado'));
  }

  useEffect(() => {
    verificar();
  }, []);

  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [espacioId, setEspacioId] = useState<string | null>(null);

  useEffect(() => {
    obtenerEspacios().then((r) => {
      if (!esError(r)) setEspacios(r.datos);
    });
  }, []);

  const [resultado, setResultado] = useState<{
    ok: boolean;
    mensaje: string;
  } | null>(null);
  const leyendo = useRef(false);

  async function alLeerQr(codigo: string) {
    if (!espacioId || leyendo.current) return;
    leyendo.current = true;
    try {
      const reserva = await registrarIngreso(codigo, espacioId);
      vibrarExito();
      setResultado({ ok: true, mensaje: textoTurno(reserva.turnoId) });
    } catch (err) {
      vibrarError();
      setResultado({
        ok: false,
        mensaje: err instanceof Error ? err.message : 'QR inválido.',
      });
    }
  }

  function escanearOtro() {
    setResultado(null);
    leyendo.current = false;
  }

  if (!permiso) return <View style={styles.centro} />;

  if (!verificado) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>Confirmá tu identidad para escanear.</Text>
        <Boton titulo="Usar huella" onPress={verificar} />
      </View>
    );
  }

  if (!permiso.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>
          Necesitamos la cámara para leer el QR de las reservas.
        </Text>
        <Boton titulo="Permitir cámara" onPress={() => pedirPermiso()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        style={styles.selector}
        contentContainerStyle={{ gap: 8, padding: 12 }}
        showsHorizontalScrollIndicator={false}
      >
        {espacios.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => setEspacioId(e.id)}
            style={[styles.chip, espacioId === e.id && styles.chipElegido]}
          >
            <Text style={espacioId === e.id ? styles.textoElegido : undefined}>
              {e.nombre}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {!espacioId ? (
        <View style={styles.centro}>
          <Text style={styles.texto}>Elegí en qué cancha estás.</Text>
        </View>
      ) : resultado ? (
        <View
          style={[
            styles.centro,
            { backgroundColor: resultado.ok ? '#C8E6C9' : '#EF9A9A' },
          ]}
        >
          <Text style={styles.veredicto}>
            {resultado.ok ? '✅ Puede pasar' : '❌ No puede pasar'}
          </Text>
          <Text style={[styles.texto, { color: '#000' }]}>
            {resultado.mensaje}
          </Text>
          <Boton titulo="Escanear otro" onPress={escanearOtro} />
        </View>
      ) : (
        <CameraView
          style={styles.camara}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => alLeerQr(data)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  texto: { fontSize: 15, textAlign: 'center' },
  camara: { flex: 1 },
  selector: { flexGrow: 0 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#A4438C22',
  },
  chipElegido: { backgroundColor: '#A4438C' },
  textoElegido: { color: '#FFFFFF' },
  veredicto: { fontSize: 22, fontWeight: 'bold', color: '#000' },
});
