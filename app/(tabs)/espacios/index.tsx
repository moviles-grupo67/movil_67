import { StyleSheet, FlatList, Pressable, View, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { obtenerEspacios } from '@/src/servicios/espacios';
import { esError } from '@/src/tipos/api';
import { Espacio } from '@/src/tipos/espacio';
import { Text } from '@/components/Themed';
import { Icono } from '@/components/Icono';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Image } from 'expo-image';
import { obtenerDeportes } from '@/src/servicios/deportes';
import { Deporte } from '@/src/tipos/deporte';
import { Boton } from '@/components/Boton';


export default function EspaciosScreen() {

  const tema = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();

  const [espacios, setEspacios] = useState<Espacio[]>([]);

  useEffect(() => {
    obtenerEspacios().then((resultado) => {
      if (!esError(resultado)) {
        setEspacios(resultado.datos);
      }
    });
  }, []);

  const [deportes, setDeportes] = useState<Deporte[]>([]);

  const [deporteSeleccionado, setDeporteSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    obtenerDeportes().then((resultado) => {
      if (!esError(resultado)) {
        setDeportes(resultado.datos);
      }
    });
  }, []);

  const [complejoSeleccionado, setComplejoSeleccionado] = useState<string | null>(null);

  const complejos = [...new Set(espacios.map((e) => e.complejo))];

  const espaciosFiltrados = espacios.filter((e) => {
    const coincideDeporte = !deporteSeleccionado || e.deporteId === deporteSeleccionado;
    const coincideComplejo = !complejoSeleccionado || e.complejo === complejoSeleccionado;
    return coincideDeporte && coincideComplejo;
  });

  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const cantidadFiltrosActivos = (deporteSeleccionado ? 1 : 0) + (complejoSeleccionado ? 1 : 0);

    return (
    <>
      <FlatList
        data={espaciosFiltrados}
        keyExtractor={(espacio) => espacio.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <Pressable style={[styles.botonFiltro, { borderColor: tema.tint + '33' }]} onPress={() => setFiltrosVisibles(true)}>
            <Icono nombre="filtro" color={tema.tint} size={18} />
            <Text style={[styles.textoBotonFiltro, { color: tema.tint }]}>
              Filtros{cantidadFiltrosActivos > 0 ? ` (${cantidadFiltrosActivos})` : ''}
            </Text>
          </Pressable>
        }
        renderItem={({ item: espacio }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/espacios/[id]', params: { id: espacio.id } })}
            style={({ pressed }) => [
              styles.tarjeta,
              { backgroundColor: tema.surface, borderColor: tema.tabIconDefault + '33' },
              pressed && styles.presionada,
            ]}>
            <Image
              source={
                espacio.imagenes[0]
                  ? { uri: espacio.imagenes[0] }
                  : require('@/assets/images/icon.png')
              }
              style={styles.miniatura}
            />
            <View style={styles.info}>
              <Text style={styles.nombre}>{espacio.nombre}</Text>
              <Text style={styles.complejo}>{espacio.complejo}</Text>

              <View style={styles.chips}>
                <Text style={[styles.chip, { color: tema.tint, backgroundColor: tema.tint + '22' }]}>
                  {espacio.techado ? 'Techada' : 'Al aire libre'}
                </Text>
                {espacio.iluminacion && (
                  <Text style={[styles.chip, { color: tema.tint, backgroundColor: tema.tint + '22' }]}>
                    Con luz
                  </Text>
                )}
              </View>

              <Text style={[styles.precio, { color: tema.tint }]}>
                $ {espacio.precioPorHora.toLocaleString('es-AR')} / hora
              </Text>
            </View>

            <Icono nombre="chevron" color={tema.tabIconDefault} size={20} />
          </Pressable>
        )}
      />

      <Modal
        visible={filtrosVisibles}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltrosVisibles(false)}>
        <Pressable style={styles.fondoModal} onPress={() => setFiltrosVisibles(false)}>
          <Pressable style={[styles.panelFiltros, { backgroundColor: tema.surface }]} onPress={() => {}}>
            <Text style={[styles.tituloFiltros, { color: tema.text }]}>Deporte</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[{ id: null, nombre: 'Todos' }, ...deportes]}
              keyExtractor={(item) => item.id ?? 'todos'}
              contentContainerStyle={styles.chipsFiltro}
              renderItem={({ item }) => (
                <Pressable onPress={() => setDeporteSeleccionado(item.id)}>
                  <Text
                    style={[
                      styles.chipFiltro,
                      {
                        backgroundColor: deporteSeleccionado === item.id ? tema.tint : tema.background,
                        color: deporteSeleccionado === item.id ? '#FFFFFF' : tema.text,
                        borderColor: tema.tabIconDefault + '33',
                      },
                    ]}>
                    {item.nombre}
                  </Text>
                </Pressable>
              )}
            />

            <Text style={[styles.tituloFiltros, { color: tema.text }]}>Complejo</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['Todos', ...complejos]}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.chipsFiltro}
              renderItem={({ item }) => {
                const esActivo = item === 'Todos' ? !complejoSeleccionado : complejoSeleccionado === item;
                return (
                  <Pressable onPress={() => setComplejoSeleccionado(item === 'Todos' ? null : item)}>
                    <Text
                      style={[
                        styles.chipFiltro,
                        {
                          backgroundColor: esActivo ? tema.tint : tema.background,
                          color: esActivo ? '#FFFFFF' : tema.text,
                          borderColor: tema.tabIconDefault + '33',
                        },
                      ]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <Boton titulo="Listo" onPress={() => setFiltrosVisibles(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  lista: { padding: 20, gap: 12 },
  chipsFiltro: { gap: 8, paddingBottom: 16 },
  chipFiltro: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  miniatura: { width: 56, height: 56, borderRadius: 12 },
  presionada: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  info: { flex: 1, gap: 4 },
  nombre: { fontFamily: 'Inter-Medium', fontSize: 17 },
  complejo: { fontFamily: 'Inter-Regular', fontSize: 13, opacity: 0.6 },
  chips: { flexDirection: 'row', gap: 6, marginTop: 6 },
  chip: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  precio: { fontFamily: 'Inter-Medium', fontSize: 15, marginTop: 6 },
  botonFiltro: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  alignSelf: 'flex-end',
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  marginBottom: 16,
},
  textoBotonFiltro: { fontFamily: 'Inter-Medium', fontSize: 13 },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  panelFiltros: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  tituloFiltros: { fontFamily: 'Inter-Medium', fontSize: 15, marginBottom: 8, marginTop: 12 },
});