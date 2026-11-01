import { Boton } from '@/components/Boton';
import { Icono } from '@/components/Icono';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { autenticar, biometriaDisponible } from '@/src/servicios/biometria';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { IngresoRegistrado, registrarIngreso } from '@/src/servicios/ingresos';
import { vibrarError, vibrarExito } from '@/src/servicios/vibracion';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { Reserva } from '@/src/tipos/reserva';
import { inicioDeTurno, textoHora } from '@/src/utils/turnos';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';

type Resultado =
  | { ok: true; ingreso: IngresoRegistrado }
  | { ok: false; mensaje: string };

function descripcionTurno(reserva: Reserva): string {
  const hora = textoHora(inicioDeTurno(reserva.turnoId));
  const n = reserva.cantidadPersonas;
  return `Turno de las ${hora} · ${n} ${n === 1 ? 'persona' : 'personas'}`;
}

export default function EscanearScreen() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const enfocada = useIsFocused();

  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [errorEspacios, setErrorEspacios] = useState<string | null>(null);
  const [complejo, setComplejo] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const ocupado = useRef(false);
  const tema = Colors[useColorScheme() ?? 'light'];
  const [verificado, setVerificado] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [errorVerificacion, setErrorVerificacion] = useState<string | null>(
    null,
  );

  useEffect(() => {
    obtenerEspacios().then((respuesta) => {
      if (esError(respuesta)) {
        setErrorEspacios(respuesta.error.mensaje);
      } else {
        setEspacios(respuesta.datos.filter((e) => e.activo));
      }
    });
  }, []);

  useEffect(() => {
    if (!enfocada) {
      setVerificado(false);
      setResultado(null);
      ocupado.current = false;
    }
  }, [enfocada]);

  const complejos = Array.from(new Set(espacios.map((e) => e.complejo)));

  async function alEscanear(codigo: string) {
    if (!complejo || ocupado.current) return;
    ocupado.current = true;
    setProcesando(true);

    const respuesta = await registrarIngreso(codigo, complejo);
    if (esError(respuesta)) {
      vibrarError();
    } else {
      vibrarExito();
    }
    setResultado(
      esError(respuesta)
        ? { ok: false, mensaje: respuesta.error.mensaje }
        : { ok: true, ingreso: respuesta.datos },
    );
  }

  function escanearOtro() {
    setResultado(null);
    ocupado.current = false;
  }

  async function verificarIdentidad() {
    setVerificando(true);
    setErrorVerificacion(null);

    if (!(await biometriaDisponible())) {
      setErrorVerificacion(
        'Para escanear necesitás una huella o un bloqueo de pantalla configurado en el teléfono.',
      );
    } else if (await autenticar('Confirmá tu identidad para escanear')) {
      setVerificado(true);
    } else {
      setErrorVerificacion(
        'No pudimos verificar tu identidad. Probá de nuevo.',
      );
    }

    setVerificando(false);
  }

  if (!verificado) {
    return (
      <View style={styles.centro}>
        <Icono nombre="huella" color={tema.tint} size={48} />
        <Text style={styles.titulo}>Verificá tu identidad</Text>
        <Text style={styles.texto}>
          Por seguridad, pedimos la huella o el bloqueo del teléfono antes de
          escanear.
        </Text>
        {errorVerificacion && (
          <Text style={styles.textoError}>{errorVerificacion}</Text>
        )}
        <Boton
          titulo="Verificar"
          onPress={verificarIdentidad}
          cargando={verificando}
        />
      </View>
    );
  }

  if (!permiso) return <View style={styles.centro} />;

  if (!permiso.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.titulo}>Necesitamos la cámara</Text>
        <Text style={styles.texto}>
          La usamos solo para escanear el QR de las reservas.
        </Text>
        <Boton
          titulo={permiso.canAskAgain ? 'Permitir cámara' : 'Abrir ajustes'}
          onPress={permiso.canAskAgain ? pedirPermiso : Linking.openSettings}
        />
      </View>
    );
  }

  if (!complejo) {
    return (
      <View style={styles.contenedor}>
        <ScrollView contentContainerStyle={styles.lista}>
          <Text style={styles.titulo}>¿En qué complejo estás?</Text>
          <Text style={styles.texto}>
            Vas a poder escanear las reservas de todas sus canchas.
          </Text>
          {errorEspacios && <Text style={styles.texto}>{errorEspacios}</Text>}
          {complejos.map((nombre) => {
            const cantidad = espacios.filter(
              (e) => e.complejo === nombre,
            ).length;
            return (
              <Pressable
                key={nombre}
                onPress={() => setComplejo(nombre)}
                accessibilityRole="button"
                style={styles.opcion}
              >
                <Text style={styles.nombreEspacio}>{nombre}</Text>
                <Text style={styles.texto}>
                  {cantidad} {cantidad === 1 ? 'espacio' : 'espacios'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.barra}>
        <Text style={styles.nombreEspacio}>{complejo}</Text>
        <Pressable
          onPress={() => {
            setComplejo(null);
            escanearOtro();
          }}
        >
          <Text style={styles.enlace}>Cambiar</Text>
        </Pressable>
      </View>

      <View style={styles.camara}>
        {enfocada && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => alEscanear(data)}
          />
        )}
      </View>

      <View
        style={[
          styles.panel,
          resultado && (resultado.ok ? styles.panelOk : styles.panelError),
        ]}
      >
        {resultado ? (
          <>
            <Text style={styles.tituloResultado}>
              {resultado.ok ? 'Ingreso registrado' : 'No se puede ingresar'}
            </Text>
            {resultado.ok ? (
              <>
                <Text style={styles.cancha}>
                  {resultado.ingreso.espacio.nombre}
                </Text>
                <Text style={styles.textoResultado}>
                  {descripcionTurno(resultado.ingreso.reserva)}
                </Text>
              </>
            ) : (
              <Text style={styles.textoResultado}>{resultado.mensaje}</Text>
            )}
            <Boton
              titulo="Escanear otro"
              variante="secundario"
              onPress={escanearOtro}
            />
          </>
        ) : (
          <Text style={styles.texto}>
            {procesando
              ? 'Verificando...'
              : 'Apuntá la cámara al código QR de la reserva.'}
          </Text>
        )}
      </View>
    </View>
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
  contenedor: { flex: 1 },
  lista: { padding: 16, gap: 12 },
  opcion: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#B7A3AC55',
  },
  barra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  camara: { flex: 1, overflow: 'hidden' },
  panel: { padding: 16, gap: 8, alignItems: 'stretch' },
  panelOk: { backgroundColor: '#2E7D32' },
  panelError: { backgroundColor: '#B71C1C' },
  titulo: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  texto: { fontSize: 15, textAlign: 'center', opacity: 0.8 },
  nombreEspacio: { fontSize: 16, fontWeight: '600' },
  enlace: { fontSize: 15, textDecorationLine: 'underline' },
  tituloResultado: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  cancha: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  textoResultado: { fontSize: 15, textAlign: 'center', color: '#FFFFFF' },
  textoError: { fontSize: 14, textAlign: 'center', color: '#D32F2F' },
});
