import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { obtenerReservas } from '@/src/servicios/reservas';
import { espacios } from '@/src/mocks/espacios';
import { Link, useFocusEffect } from 'expo-router';
import { Reserva } from '@/src/tipos/reserva';

export default function ReservasScreen() {

  const [reservas, setReservas] = useState<Reserva[]>([]);

  useFocusEffect(
    useCallback(() => {
      obtenerReservas().then(setReservas);
    }, [])
  );

  const [pestaña, setPestaña] = useState<'próximas' | 'pasadas'>('próximas');
  const reservasFiltradas = reservas.filter((r) => pestaña === 'próximas' ? r.estado === 'confirmada' : r.estado !== 'confirmada')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis reservas</Text>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setPestaña('próximas')}
        >
          <Text
            style={pestaña === 'próximas' ? styles.tabActivo : styles.tab}
          >
            Próximas
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setPestaña('pasadas')}
        >
          <Text
            style={pestaña === 'pasadas' ? styles.tabActivo : styles.tab}
          >
            Pasadas
          </Text>
        </Pressable>
      </View>
      {reservasFiltradas.map((reserva) => {
        const espacio = espacios.find((e) => e.id === reserva.espacioId);
        return (
          <View key={reserva.id} style={styles.card}>
            <Text style={styles.cardTitulo}>{espacio?.nombre}</Text>
            <Text>{reserva.estado}</Text>
            <Link href={{ pathname: '/reservas/[id]', params: { id: reserva.id } }}>
              <Text style={{ color: '#A4438C', fontWeight: 'bold', marginTop: 8 }}>Ver código QR</Text>
            </Link>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontFamily: 'Inter-Medium' },
  tabs: { flexDirection: 'row', gap: 20, marginBottom: 16}, 
  tab: { fontSize: 16, fontWeight: 'bold', color: '#A4438C'},
  tabActivo: { fontSize: 16, fontWeight: 'bold', color: '#A4438C'},
  card: { backgroundColor: '#F8F3F6', padding: 14, borderRadius: 10, marginBottom: 10 },
  cardTitulo: { fontWeight: 'bold', fontSize: 16 },
});