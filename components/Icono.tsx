import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type NombreIcono =
  | 'candado'
  | 'sobre'
  | 'usuario'
  | 'arroba'
  | 'llave'
  | 'flecha'
  | 'calendario'
  | 'estrella'
  | 'alerta'
  | 'usuarioX'
  | 'chevron'
  | 'salir'
  | 'huella';

interface Props {
  nombre: NombreIcono;
  color: string;
  size?: number;
}

export function Icono({ nombre, color, size = 20 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      {nombre === 'candado' && (
        <>
          <Rect x={3} y={11} width={18} height={11} rx={2} />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      )}
      {nombre === 'sobre' && (
        <>
          <Rect x={2} y={4} width={20} height={16} rx={2} />
          <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </>
      )}
      {nombre === 'usuario' && (
        <>
          <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <Circle cx={12} cy={7} r={4} />
        </>
      )}
      {nombre === 'arroba' && (
        <>
          <Circle cx={12} cy={12} r={4} />
          <Path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
        </>
      )}
      {nombre === 'llave' && (
        <>
          <Path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
          <Circle cx={16.5} cy={7.5} r={0.5} fill={color} />
        </>
      )}
      {nombre === 'calendario' && (
        <>
          <Rect x={3} y={4} width={18} height={18} rx={2} />
          <Path d="M16 2v4" />
          <Path d="M8 2v4" />
          <Path d="M3 10h18" />
        </>
      )}
      {nombre === 'estrella' && (
        <Path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
      )}
      {nombre === 'alerta' && (
        <>
          <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <Path d="M12 9v4" />
          <Path d="M12 17h.01" />
        </>
      )}
      {nombre === 'usuarioX' && (
        <>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <Circle cx={9} cy={7} r={4} />
          <Path d="m17 8 5 5" />
          <Path d="m22 8-5 5" />
        </>
      )}
      {nombre === 'chevron' && <Path d="m9 18 6-6-6-6" />}
      {nombre === 'salir' && (
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Path d="m16 17 5-5-5-5" />
          <Path d="M21 12H9" />
        </>
      )}
      {nombre === 'huella' && (
        <>
          <Path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
          <Path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
          <Path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
          <Path d="M2 12a10 10 0 0 1 18-6" />
          <Path d="M2 16h.01" />
          <Path d="M21.8 16c.2-2 .131-5.354 0-6" />
          <Path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
          <Path d="M8.65 22c.21-.66.45-1.32.57-2" />
          <Path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
        </>
      )}
      {nombre === 'flecha' && (
        <>
          <Path d="M5 12h14" />
          <Path d="m12 5 7 7-7 7" />
        </>
      )}
    </Svg>
  );
}
