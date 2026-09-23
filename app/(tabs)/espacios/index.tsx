import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { espacios } from '@/src/mocks/espacios';

//Aca complete un poco para poder probar reservas pero pueden modificar cuando les toque el turno

export default function EspaciosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Espacios</Text>
      {espacios.map((espacio) => (
        <Link key={espacio.id} href={{ pathname: '/espacios/[id]', params: { id: espacio.id } }}>
          <Text style={styles.link}>{espacio.nombre}</Text>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontFamily: 'Inter-Medium', marginBottom: 16 },
  link: { color: '#A4438C', fontSize: 16, marginBottom: 12 },
});