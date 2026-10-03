import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparecer } from '@/components/Aparecer';
import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Icono } from '@/components/Icono';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/auth-context';
import { vibrarError, vibrarExito } from '@/src/servicios/vibracion';

export default function IngresoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tema = Colors[useColorScheme() ?? 'light'];
  const { ingresar, crearCuenta, bloqueada, desbloquear } = useAuth();

  const params = useLocalSearchParams<{ resumen?: string; modo?: string }>();
  const resumen = Array.isArray(params.resumen) ? params.resumen[0] : params.resumen;
  const paraReservar = !!resumen;

  const [creando, setCreando] = useState(params.modo === 'crear');
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usuarioRef = useRef<TextInput>(null);
  const contrasenaRef = useRef<TextInput>(null);

  const sacudida = useRef(new Animated.Value(0)).current;

  function sacudir() {
    const paso = (valor: number) =>
      Animated.timing(sacudida, { toValue: valor, duration: 60, useNativeDriver: true });
    Animated.sequence([paso(10), paso(-10), paso(6), paso(-6), paso(0)]).start();
  }

  function fallar(mensaje: string) {
    setError(mensaje);
    vibrarError();
    sacudir();
  }

  function cambiarModo() {
    setCreando((c) => !c);
    setError(null);
  }

  function volver() {
    if (router.canGoBack()) router.back();
    else router.replace('/cuenta');
  }

  async function enviar() {
    if (enviando) return;
    if (!usuario.trim() || !contrasena || (creando && !nombre.trim())) {
      fallar('Completá todos los campos.');
      return;
    }
    setError(null);
    setEnviando(true);
    const mensaje = creando
      ? await crearCuenta(nombre, usuario, contrasena)
      : await ingresar(usuario, contrasena);
    setEnviando(false);
    if (mensaje) {
      fallar(mensaje);
      return;
    }
    vibrarExito();
    volver();
  }

  async function desbloquearYVolver() {
    if (await desbloquear()) volver();
  }

  const titulo = creando
    ? 'Creá tu cuenta'
    : paraReservar
      ? 'Ingresá para confirmar el turno'
      : 'Ingresá a tu cuenta';
  const textoBotonPrincipal = creando
    ? paraReservar ? 'Crear cuenta y reservar' : 'Crear cuenta'
    : paraReservar ? 'Entrar y reservar' : 'Entrar';

  return (
    <View style={styles.pantalla} lightColor={Colors.light.surface} darkColor={Colors.dark.surface}>
      <KeyboardAvoidingView
        style={styles.pantalla}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.contenido,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled">
          <Aparecer style={styles.columna}>
            <View style={styles.logoCaja} lightColor="#FFFFFF" darkColor="#FFFFFF">
              <Image
                source={require('../assets/images/logo_vilaguay.jpg')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Municipio de Villaguay"
              />
            </View>

            {paraReservar && (
              <View style={styles.etiquetaFila} lightColor="transparent" darkColor="transparent">
                <Icono nombre="candado" color={tema.tint} size={14} />
                <Text style={[styles.etiqueta, { color: tema.tint }]}>Sólo para reservar</Text>
              </View>
            )}

            <Text style={styles.titulo}>{titulo}</Text>
            {paraReservar ? (
              <Text style={styles.subtitulo}>
                {resumen}. Mirar la disponibilidad no necesita cuenta.
              </Text>
            ) : null}

            {bloqueada && (
              <View style={styles.bloqueo} lightColor="transparent" darkColor="transparent">
                <Text style={styles.subtitulo}>Tenés una sesión guardada en este dispositivo.</Text>
                <Boton
                  titulo="Desbloquear con huella"
                  variante="secundario"
                  onPress={desbloquearYVolver}
                />
              </View>
            )}

            <Animated.View style={[styles.campos, { transform: [{ translateX: sacudida }] }]}>
              {creando && (
                <CampoTexto
                  icono="usuario"
                  placeholder="Nombre y apellido"
                  value={nombre}
                  onChangeText={setNombre}
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={() => usuarioRef.current?.focus()}
                />
              )}
              <CampoTexto
                ref={usuarioRef}
                icono="arroba"
                placeholder="Usuario"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                returnKeyType="next"
                onSubmitEditing={() => contrasenaRef.current?.focus()}
              />
              <CampoTexto
                ref={contrasenaRef}
                icono="llave"
                placeholder="Contraseña"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry={!verContrasena}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={creando ? 'new-password' : 'current-password'}
                returnKeyType="done"
                onSubmitEditing={enviar}
                derecha={
                  <Pressable onPress={() => setVerContrasena((v) => !v)} hitSlop={8}>
                    <Text style={[styles.mostrar, { color: tema.tint }]}>
                      {verContrasena ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </Pressable>
                }
              />
            </Animated.View>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.botones} lightColor="transparent" darkColor="transparent">
              <Boton titulo={textoBotonPrincipal} onPress={enviar} cargando={enviando} />
              <Boton
                titulo={creando ? 'Ya tengo cuenta' : 'Crear cuenta'}
                variante="secundario"
                onPress={cambiarModo}
                deshabilitado={enviando}
              />
            </View>

            <Pressable style={styles.salir} onPress={volver} hitSlop={8}>
              <Text style={styles.salirTexto}>Seguir mirando sin cuenta</Text>
              <Icono nombre="flecha" color={tema.tabIconDefault} size={16} />
            </Pressable>

            {__DEV__ && !creando && <Text style={styles.pista}>Prueba: jugador / 123456</Text>}
          </Aparecer>
        </ScrollView>
      </KeyboardAvoidingView>

      <Pressable
        style={[styles.atras, { top: insets.top + 8 }]}
        onPress={volver}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Volver">
        <Icono nombre="flecha" color={tema.text} size={24} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  atras: {
    position: 'absolute',
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
    zIndex: 10,
  },
  contenido: { paddingHorizontal: 20, flexGrow: 1 },
  columna: { gap: 12 },
  logoCaja: {
    alignSelf: 'center',
    width: 220,
    height: 130,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 200, height: 120 },
  etiquetaFila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  etiqueta: { fontFamily: 'Inter-Regular', fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' },
  titulo: { fontFamily: 'Inter-Medium', fontSize: 24 },
  subtitulo: { fontFamily: 'Inter-Regular', fontSize: 14, opacity: 0.65, lineHeight: 20 },
  bloqueo: { gap: 10 },
  campos: { gap: 12, marginTop: 4 },
  mostrar: { fontFamily: 'Inter-Medium', fontSize: 13 },
  error: { fontFamily: 'Inter-Regular', color: '#B71C1C', fontSize: 14 },
  botones: { gap: 10, marginTop: 6 },
  salir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  salirTexto: { fontFamily: 'Inter-Regular', fontSize: 14, opacity: 0.6 },
  pista: { fontFamily: 'Inter-Regular', fontSize: 12, opacity: 0.45, textAlign: 'center' },
});
