import { Text, View } from "@/components/Themed";
import { StyleSheet } from "react-native";

// Componente que muestra una pantalla de "En construcción" con un título y descripción proporcionados como props.
// Cuando termine todas las pantallas esto se borrará y se reemplazará por la pantalla correspondiente.

interface Props {
  titulo: string;
  descripcion: string;
}

export function PantallaPendiente({ titulo, descripcion }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descripcion}>{descripcion}</Text>
      <Text style={styles.pendiente}>En construcción</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  titulo: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  descripcion: { fontSize: 15, textAlign: "center", opacity: 0.8 },
  pendiente: { fontSize: 13, marginTop: 12, opacity: 0.5 },
});
