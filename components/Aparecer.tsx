import { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: ReactNode;
  retraso?: number;
  style?: StyleProp<ViewStyle>;
}

export function Aparecer({ children, retraso = 0, style }: Props) {
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progreso, {
      toValue: 1,
      duration: 420,
      delay: retraso,
      useNativeDriver: true,
    }).start();
  }, [progreso, retraso]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progreso,
          transform: [{ translateY: progreso.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}>
      {children}
    </Animated.View>
  );
}
