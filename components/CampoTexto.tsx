import { forwardRef, ReactNode } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { Icono, NombreIcono } from '@/components/Icono';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface Props extends TextInputProps {
  icono: NombreIcono;
  derecha?: ReactNode;
}

export const CampoTexto = forwardRef<TextInput, Props>(function CampoTexto(
  { icono, derecha, style, ...resto },
  ref
) {
  const tema = Colors[useColorScheme() ?? 'light'];

  return (
    <View
      style={[
        styles.contenedor,
        { backgroundColor: tema.background, borderColor: tema.tabIconDefault + '55' },
      ]}>
      <Icono nombre={icono} color={tema.text} size={18} />
      <TextInput
        ref={ref}
        style={[styles.input, { color: tema.text }, style]}
        placeholderTextColor={tema.tabIconDefault}
        {...resto}
      />
      {derecha}
    </View>
  );
});

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 16, paddingVertical: 10 },
});
