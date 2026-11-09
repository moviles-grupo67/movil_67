import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { obtenerEspacioPorId } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { useRouter } from 'expo-router';
import { cancelarReserva } from '@/src/servicios/reservas';
import { obtenerReservaPorId } from '@/src/servicios/reservas';
import { useEffect, useState } from 'react';
import { Reserva } from '@/src/tipos/reserva';
import { cancelarRecordatorioTurno } from '@/src/servicios/avisos';
import { textoTurno, textoHora, textoDia } from '@/src/utils/turnos';
import { vibrarExito, vibrarError } from '@/src/servicios/vibracion';
import { Boton } from '@/components/Boton';

export default function DetalleReserva() {
    const { id } = useLocalSearchParams();

    const [reserva, setReserva] = useState<Reserva | undefined>(undefined);
    const [espacio, setEspacio] = useState<Espacio | undefined>(undefined);

    useEffect(() => {
        if (!reserva) return;
        obtenerEspacioPorId(reserva.espacioId).then((r) => {
            if (!esError(r)) setEspacio(r.datos);
        });
    }, [reserva]);
    useEffect(() => {
        obtenerReservaPorId(String(id)).then(setReserva);
    }, [id]);

    const hasta = reserva ? new Date(reserva.cancelableHasta) : null;
    const horaLimite = hasta ? textoHora(hasta) : '';
    const sePuedeCancelar = hasta ? new Date() <= hasta : false;

    const esHoy = hasta ? hasta.toDateString() === new Date().toDateString() : false;
    const diaLimite = esHoy ? 'de hoy' : `del ${hasta ? textoDia(hasta) : ''}`;

    const router = useRouter();

    async function handleCancelar() {
        if (!reserva) return;
        try {
            await cancelarReserva(reserva.id);
            await cancelarRecordatorioTurno(reserva.id);
            vibrarExito();
            router.back();
        } catch (err) {
            vibrarError();
            if (err instanceof Error) {
                alert(err.message);
            }
        }
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
            {reserva && (
                <Text style={styles.fecha}>{textoTurno(reserva.turnoId)}</Text>
            )}
            <Text>
                {espacio?.complejo}
            </Text>
            <Text>
                $ {espacio?.precioPorHora.toLocaleString('es-AR')} - se paga en el lugar
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
            <View style={styles.contenedorBoton}>
                <Boton
                    titulo="Cancelar reserva"
                    variante="peligro"
                    onPress={handleCancelar}
                    deshabilitado={!sePuedeCancelar}
                />
            </View>
            {reserva && (
                <Text style={styles.ayuda}>
                    {sePuedeCancelar
                        ? `Se puede cancelar sin aviso hasta las ${horaLimite} ${diaLimite}`
                        : 'Para cancelar, avisá a la Dirección de Deportes'}
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center' },
    titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    qrContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginVertical: 24 },
    codigo: { fontWeight: 'bold', letterSpacing: 1 },
    ayuda: { color: '#999', marginTop: 4 },
    contenedorBoton: { alignSelf: 'stretch', marginTop: 24 },
    fecha: { fontSize: 16, fontWeight: 'bold', color: '#A4438C', marginBottom: 4 },
})