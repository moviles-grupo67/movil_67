import { View, Text, StyleSheet } from 'react-native';

export default function ReservasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis reservas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});