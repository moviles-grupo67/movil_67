import { useHeader } from "@/components/useHeader";
import { useAuth } from "@/contexts/auth-context";
import { esStaff } from "@/src/dominio/permisos";
import { useIsFocused } from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";

export default function GestionLayout() {
  const header = useHeader();
  const { sesion, cargando } = useAuth();
  const enfocada = useIsFocused();

  if (cargando) return null;

  if (!esStaff(sesion?.usuario.rol)) {
    return enfocada ? <Redirect href="/espacios" /> : null;
  }

  return (
    <Stack screenOptions={{ ...header }}>
      <Stack.Screen name="index" options={{ title: "Gestión" }} />
      <Stack.Screen name="agenda" options={{ title: "Agenda del día" }} />
      <Stack.Screen name="escanear" options={{ title: "Escanear QR" }} />
      <Stack.Screen name="bloqueos" options={{ title: "Bloqueos" }} />
      <Stack.Screen name="fijas" options={{ title: "Reservas fijas" }} />
      <Stack.Screen name="precios" options={{ title: "Precios" }} />
    </Stack>
  );
}
