import { StyleSheet, Alert, ActivityIndicator, Linking } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useCallback, useEffect, useState } from 'react';
import { obtenerEspacioPorId } from '@/src/servicios/espacios';
import { cancelarReserva, obtenerReservaPorId } from '@/src/servicios/reservas';
import { cancelarRecordatorioTurno } from '@/src/servicios/avisos';
import { vibrarExito, vibrarError } from '@/src/servicios/vibracion';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { Reserva } from '@/src/tipos/reserva';
import { textoTurno, textoHora, textoDia } from '@/src/utils/turnos';
import { Boton } from '@/components/Boton';

export default function DetalleReserva() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const tema = Colors[useColorScheme() ?? 'light'];

    const [reserva, setReserva] = useState<Reserva | null>(null);
    const [espacio, setEspacio] = useState<Espacio | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelando, setCancelando] = useState(false);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        const rReserva = await obtenerReservaPorId(String(id));
        if (esError(rReserva)) {
            setError(rReserva.error.mensaje);
            setCargando(false);
            return;
        }
        setReserva(rReserva.datos);
        const rEspacio = await obtenerEspacioPorId(rReserva.datos.espacioId);
        if (!esError(rEspacio)) setEspacio(rEspacio.datos);
        setCargando(false);
    }, [id]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const hasta = reserva ? new Date(reserva.cancelableHasta) : null;
    const horaLimite = hasta ? textoHora(hasta) : '';
    // Solo se cancela una reserva confirmada y antes del límite.
    const sePuedeCancelar = reserva?.estado === 'confirmada' && hasta !== null && new Date() <= hasta;

    const esHoy = hasta ? hasta.toDateString() === new Date().toDateString() : false;
    const diaLimite = esHoy ? 'de hoy' : `del ${hasta ? textoDia(hasta) : ''}`;

    async function handleCancelar() {
        if (!reserva) return;
        setCancelando(true);
        const rCancelacion = await cancelarReserva(reserva.id);
        setCancelando(false);
        if (esError(rCancelacion)) {
            vibrarError();
            Alert.alert('No se pudo cancelar', rCancelacion.error.mensaje);
            return;
        }
        await cancelarRecordatorioTurno(reserva.id);
        vibrarExito();
        router.back();
    }

    function abrirComoLlegar() {
        if (!espacio) return;
        const { latitud, longitud } = espacio.coordenadas;
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`);
    }

    if (cargando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={tema.tint} />
            </View>
        );
    }

    if (error || !reserva) {
        return (
            <View style={styles.centro}>
                <Text style={styles.ayuda}>{error ?? 'No encontramos la reserva.'}</Text>
                <Boton titulo="Reintentar" variante="secundario" onPress={cargar} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>{espacio?.nombre}</Text>
            <Text style={[styles.fecha, { color: tema.tint }]}>{textoTurno(reserva.turnoId)}</Text>
            <Text>{espacio?.complejo}</Text>
            <Text>$ {espacio?.precioPorHora.toLocaleString('es-AR')} - se paga en el lugar</Text>

            <View style={styles.qrContainer}>
                <QRCode value={reserva.codigoQr} size={200} />
            </View>

            <Text style={styles.codigo}>{reserva.codigoQr}</Text>
            <Text style={styles.ayuda}>Mostráselo al encargado</Text>

            {reserva.estado === 'confirmada' && (
                <>
                    <View style={styles.contenedorBoton}>
                        <Boton titulo="Cómo llegar" variante="secundario" onPress={abrirComoLlegar} />
                        <Boton
                            titulo="Cancelar reserva"
                            variante="peligro"
                            onPress={handleCancelar}
                            deshabilitado={!sePuedeCancelar}
                            cargando={cancelando}
                        />
                    </View>
                    <Text style={styles.ayuda}>
                        {sePuedeCancelar
                            ? `Se puede cancelar sin aviso hasta las ${horaLimite} ${diaLimite}`
                            : 'Para cancelar, avisá a la Dirección de Deportes'}
                    </Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center' },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
    titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    fecha: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    // El QR siempre va sobre blanco: el escáner lo lee mejor con contraste.
    qrContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginVertical: 24 },
    codigo: { fontWeight: 'bold', letterSpacing: 1 },
    ayuda: { opacity: 0.6, marginTop: 4, textAlign: 'center' },
    contenedorBoton: { alignSelf: 'stretch', marginTop: 24, gap: 10 },
});