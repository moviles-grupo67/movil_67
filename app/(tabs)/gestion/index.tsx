import { Icono, NombreIcono } from "@/components/Icono";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/auth-context";
import { Href, useRouter } from "expo-router";
import {
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
} from "react-native";

interface Seccion {
  titulo: string;
  descripcion: string;
  icono: NombreIcono;
  ruta: Href;
}

const SECCIONES: Seccion[] = [
  {
    titulo: "Agenda del día",
    descripcion: "Turnos de todos los espacios",
    icono: "calendario",
    ruta: "/gestion/agenda",
  },
  {
    titulo: "Escanear QR",
    descripcion: "Registrar el ingreso de una reserva",
    icono: "huella",
    ruta: "/gestion/escaner",
  },
  {
    titulo: "Bloqueos",
    descripcion: "Lluvia o mantenimiento",
    icono: "candado",
    ruta: "/gestion/bloqueos",
  },
  {
    titulo: "Reservas fijas",
    descripcion: "Horarios que se repiten cada semana",
    icono: "estrella",
    ruta: "/gestion/fijas",
  },
  {
    titulo: "Precios",
    descripcion: "Precio por hora de cada espacio",
    icono: "llave",
    ruta: "/gestion/precios",
  },
];

export default function GestionScreen() {
  const router = useRouter();
  const tema = Colors[useColorScheme() ?? "light"];
  const { sesion } = useAuth();

  return (
    <View style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.saludo}>Hola, {sesion?.usuario.nombre}</Text>
        <Text style={styles.subtitulo}>¿Qué querés gestionar?</Text>

        {SECCIONES.map((seccion) => (
          <Pressable
            key={seccion.titulo}
            onPress={() => router.push(seccion.ruta)}
            accessibilityRole="button"
            accessibilityLabel={seccion.titulo}
            style={({ pressed }) => [
              styles.tarjeta,
              {
                backgroundColor: tema.surface,
                borderColor: tema.tabIconDefault + "33",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <RNView
              style={[styles.circulo, { backgroundColor: tema.tint + "22" }]}
            >
              <Icono nombre={seccion.icono} color={tema.tint} size={20} />
            </RNView>
            <RNView style={styles.textos}>
              <Text style={styles.titulo}>{seccion.titulo}</Text>
              <Text style={styles.descripcion}>{seccion.descripcion}</Text>
            </RNView>
            <Icono nombre="chevron" color={tema.tabIconDefault} size={18} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  contenido: { padding: 16, gap: 12 },
  saludo: { fontSize: 22, fontWeight: "700" },
  subtitulo: { fontSize: 15, opacity: 0.7, marginBottom: 8 },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  circulo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textos: { flex: 1 },
  titulo: { fontSize: 16, fontWeight: "600" },
  descripcion: { fontSize: 13, opacity: 0.7 },
});
