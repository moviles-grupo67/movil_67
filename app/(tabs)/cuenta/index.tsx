import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View as RNView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparecer } from '@/components/Aparecer';
import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { Icono, NombreIcono } from '@/components/Icono';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/auth-context';
import { vibrarError, vibrarExito, vibrarToque } from '@/src/servicios/vibracion';
import { Rol } from '@/src/tipos/usuario';

const NOMBRE_ROL: Record<Rol, string> = {
  jugador: 'Jugador',
  encargado: 'Encargado',
  administrador: 'Administrador',
};

function Tarjeta({ children, style }: { children: ReactNode; style?: object }) {
  const tema = Colors[useColorScheme() ?? 'light'];
  return (
    <RNView
      style={[
        styles.tarjeta,
        { backgroundColor: tema.surface, borderColor: tema.tabIconDefault + '33' },
        style,
      ]}>
      {children}
    </RNView>
  );
}

function Dato({ icono, valor, etiqueta }: { icono: NombreIcono; valor: number; etiqueta: string }) {
  const tema = Colors[useColorScheme() ?? 'light'];
  return (
    <Tarjeta style={styles.dato}>
      <Icono nombre={icono} color={tema.tint} size={20} />
      <Text style={styles.datoValor}>{valor}</Text>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
    </Tarjeta>
  );
}

function IconoCirculo({ icono }: { icono: NombreIcono }) {
  const tema = Colors[useColorScheme() ?? 'light'];
  return (
    <RNView style={[styles.iconoCirculo, { backgroundColor: tema.tint + '22' }]}>
      <Icono nombre={icono} color={tema.tint} size={20} />
    </RNView>
  );
}

function Beneficio({ icono, titulo, texto }: { icono: NombreIcono; titulo: string; texto: string }) {
  return (
    <Tarjeta style={styles.fila}>
      <IconoCirculo icono={icono} />
      <RNView style={styles.textos}>
        <Text style={styles.filaTitulo}>{titulo}</Text>
        <Text style={styles.filaTexto}>{texto}</Text>
      </RNView>
    </Tarjeta>
  );
}

export default function CuentaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tema = Colors[useColorScheme() ?? 'light'];
  const {
    sesion,
    cargando,
    bloqueada,
    biometriaActivada,
    activarBiometria,
    desactivarBiometria,
    desbloquear,
    salir,
  } = useAuth();

  const banner = (
    <LinearGradient
      colors={[tema.tint, '#7E2F6B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.banner, { paddingTop: insets.top + 20, paddingBottom: sesion ? 68 : 32 }]}>
      <RNView style={styles.logoCaja}>
        <Image
          source={require('../../../assets/images/logo_vilaguay.jpg')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Municipio de Villaguay"
        />
      </RNView>
    </LinearGradient>
  );

  async function cambiarBiometria(activar: boolean) {
    if (activar) {
      const mensaje = await activarBiometria();
      if (mensaje) {
        vibrarError();
        Alert.alert('No se pudo activar', mensaje);
        return;
      }
      vibrarExito();
    } else {
      await desactivarBiometria();
      vibrarToque();
    }
  }

  if (cargando) {
    return (
      <View style={styles.pantalla}>
        {banner}
        <ActivityIndicator color={tema.tint} style={{ marginTop: 32 }} />
      </View>
    );
  }

  if (bloqueada) {
    return (
      <View style={styles.pantalla}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {banner}
          <RNView style={styles.cuerpo}>
            <Aparecer style={styles.centrado}>
              <RNView style={[styles.iconoGrande, { backgroundColor: tema.tint + '22' }]}>
                <Icono nombre="huella" color={tema.tint} size={40} />
              </RNView>
              <Text style={styles.titulo}>Sesión protegida</Text>
              <Text style={styles.subtitulo}>
                Usá tu huella o el bloqueo del dispositivo para ver tu cuenta.
              </Text>
            </Aparecer>
            <Aparecer retraso={120} style={styles.botones}>
              <Boton titulo="Desbloquear" onPress={desbloquear} />
              <Boton titulo="Usar otra cuenta" variante="secundario" onPress={salir} />
            </Aparecer>
          </RNView>
        </ScrollView>
      </View>
    );
  }

  if (!sesion) {
    return (
      <View style={styles.pantalla}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {banner}
          <RNView style={styles.cuerpo}>
            <Aparecer>
              <Text style={styles.titulo}>Reservas Deportivas</Text>
              <Text style={styles.subtitulo}>
                Reservá canchas y espacios deportivos municipales de Villaguay.
              </Text>
            </Aparecer>

            <Aparecer retraso={100}>
              <Beneficio
                icono="calendario"
                titulo="Reservá en dos clicks"
                texto="Elegí el espacio y el turno, y listo."
              />
            </Aparecer>
            <Aparecer retraso={200}>
              <Beneficio
                icono="estrella"
                titulo="Tus espacios favoritos"
                texto="Te avisamos cuando se libera un turno."
              />
            </Aparecer>

            <Aparecer retraso={300} style={styles.botones}>
              <Boton titulo="Ingresar" onPress={() => router.push('/ingreso')} />
              <Boton
                titulo="Crear cuenta"
                variante="secundario"
                onPress={() => router.push({ pathname: '/ingreso', params: { modo: 'crear' } })}
              />

              <Pressable style={styles.enlace} onPress={() => router.navigate('/espacios')} hitSlop={8}>
                <Text style={[styles.enlaceTexto, { color: tema.tint }]}>
                  Ver disponibilidad de los espacios
                </Text>
                <Icono nombre="flecha" color={tema.tint} size={16} />
              </Pressable>
              <Text style={styles.nota}>Mirar la disponibilidad no necesita cuenta.</Text>
            </Aparecer>
          </RNView>
        </ScrollView>
      </View>
    );
  }

  const { usuario } = sesion;

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {banner}

        <Aparecer style={styles.avatarFila}>
          <Avatar nombre={usuario.nombre} size={104} colorBorde={tema.background} />
        </Aparecer>

        <RNView style={styles.cuerpo}>
          <Aparecer retraso={80} style={styles.identidad}>
            <Text style={styles.nombre}>{usuario.nombre}</Text>
            <Text style={styles.usuario}>@{usuario.nombreUsuario}</Text>
            <RNView style={[styles.chip, { backgroundColor: tema.tint + '22' }]}>
              <Text style={[styles.chipTexto, { color: tema.tint }]}>{NOMBRE_ROL[usuario.rol]}</Text>
            </RNView>
          </Aparecer>

          <Aparecer retraso={160} style={styles.datos}>
            <Dato icono="estrella" valor={usuario.espaciosFavoritos.length} etiqueta="Favoritos" />
            <Dato icono="alerta" valor={usuario.cancelacionesTardias} etiqueta="Cancelaciones tardías" />
            <Dato icono="usuarioX" valor={usuario.ausencias} etiqueta="Ausencias" />
          </Aparecer>

          <Aparecer retraso={240}>
            <Text style={styles.seccion}>Mi actividad</Text>
            <Pressable onPress={() => router.navigate('/reservas')} style={styles.separado}>
              <Tarjeta style={styles.fila}>
                <IconoCirculo icono="calendario" />
                <RNView style={styles.textos}>
                  <Text style={styles.filaTitulo}>Mis reservas</Text>
                  <Text style={styles.filaTexto}>Próximas y pasadas</Text>
                </RNView>
                <Icono nombre="chevron" color={tema.tabIconDefault} size={20} />
              </Tarjeta>
            </Pressable>
          </Aparecer>

          <Aparecer retraso={320}>
            <Text style={styles.seccion}>Seguridad</Text>
            <Tarjeta style={[styles.fila, styles.separado]}>
              <IconoCirculo icono="huella" />
              <RNView style={styles.textos}>
                <Text style={styles.filaTitulo}>Desbloqueo con huella</Text>
                <Text style={styles.filaTexto}>Pedirla al abrir la app</Text>
              </RNView>
              <Switch
                value={biometriaActivada}
                onValueChange={cambiarBiometria}
                trackColor={{ false: tema.tabIconDefault + '66', true: tema.tint }}
                thumbColor="#FFFFFF"
              />
            </Tarjeta>
          </Aparecer>

          <Aparecer retraso={400} style={styles.botones}>
            <Boton titulo="Cerrar sesión" variante="secundario" onPress={salir} />
          </Aparecer>
        </RNView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  scroll: { paddingBottom: 32 },
  banner: { alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  logoCaja: {
    width: 190,
    height: 104,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 170, height: 96 },
  avatarFila: { alignItems: 'center', marginTop: -52 },
  cuerpo: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  centrado: { alignItems: 'center', gap: 8 },
  titulo: { fontFamily: 'Inter-Medium', fontSize: 24, textAlign: 'center' },
  subtitulo: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 6,
  },
  nota: { fontFamily: 'Inter-Regular', fontSize: 12, opacity: 0.55, textAlign: 'center' },
  enlace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  enlaceTexto: { fontFamily: 'Inter-Medium', fontSize: 14 },
  botones: { gap: 10, marginTop: 8 },
  tarjeta: { borderWidth: 1, borderRadius: 16 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  separado: { marginTop: 8 },
  iconoCirculo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconoGrande: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  textos: { flex: 1, gap: 2 },
  filaTitulo: { fontFamily: 'Inter-Medium', fontSize: 15 },
  filaTexto: { fontFamily: 'Inter-Regular', fontSize: 13, opacity: 0.65 },
  identidad: { alignItems: 'center', gap: 4, marginBottom: 8 },
  nombre: { fontFamily: 'Inter-Medium', fontSize: 22 },
  usuario: { fontFamily: 'Inter-Regular', fontSize: 14, opacity: 0.6 },
  chip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  chipTexto: { fontFamily: 'Inter-Medium', fontSize: 12 },
  datos: { flexDirection: 'row', gap: 10 },
  dato: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, paddingHorizontal: 6 },
  datoValor: { fontFamily: 'Inter-Medium', fontSize: 22 },
  datoEtiqueta: { fontFamily: 'Inter-Regular', fontSize: 12, opacity: 0.65, textAlign: 'center' },
  seccion: { fontFamily: 'Inter-Medium', fontSize: 16, marginTop: 4 },
});
