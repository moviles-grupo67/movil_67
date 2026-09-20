const tintColorLight = '#A4438C'; // Acento
const tintColorDark = '#C15FA3';  // Acento aclarado para fondo oscuro

export default {
  light: {
    text: '#241A21',        // Tinta
    background: '#F8F3F6',  // Fondo
    surface: '#FFFFFF',     // Superficie (tarjetas, campos, hojas)
    tint: tintColorLight,
    tabIconDefault: '#B7A3AC',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F8F3F6',
    background: '#241A21',
    surface: '#332631',     // un poco más claro que el fondo, para las tarjetas
    tint: tintColorDark,
    tabIconDefault: '#7A6873',
    tabIconSelected: tintColorDark,
  },
};