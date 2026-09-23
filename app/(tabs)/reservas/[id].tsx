import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { espacios } from '@/src/mocks/espacios';
import { useRouter } from 'expo-router';
import { cancelarReserva } from '@/src/servicios/reservas';
import { obtenerReservas } from '@/src/servicios/reservas';
import { useEffect, useState } from 'react';
import { Reserva } from '@/src/tipos/reserva';

export default function DetalleReserva() {
    const { id } = useLocalSearchParams();
    const espacio = espacios.find((e) => e.id === reserva?.espacioId);

    const [reserva, setReserva] = useState<Reserva | undefined>(undefined);

    useEffect(() => {
    obtenerReservas().then((todas) => {
        setReserva(todas.find((r) => r.id === id));
    });
    }, [id]);

    const router = useRouter();

    async function handleCancelar() {
        if (!reserva) return;
        await cancelarReserva(reserva.id);
        router.back();
    }

    return (
        <View
            style={styles.container}
        >
            <Text
                style={styles.titulo}
            >
                {espacio?.nombre}
            </Text>
            <Text>
                {espacio?.complejo}
            </Text>
            <Text>
                {espacio?.precioPorHora} - se paga en el lugar
            </Text>

            {reserva && (
                <View 
                    style={styles.qrContainer}
                >
                    <QRCode value={reserva.codigoQr} size={200} />
                </View>
            )}

            <Text
                style={styles.codigo}
            >
                {reserva?.codigoQr}
            </Text>
            <Text
                style={styles.ayuda}
            >
                Mostráselo al encargado
            </Text>
            <Pressable style={styles.botonCancelar} onPress={handleCancelar}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar reserva</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center'},
    titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    qrContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginVertical: 24 },
    codigo: { fontWeight: 'bold', letterSpacing: 1},
    ayuda: { color: '#999', marginTop: 4 },
    botonCancelar: { backgroundColor: '#B71C1C', padding: 14, borderRadius: 8, marginTop: 24, width: '100%', alignItems: 'center' },
})