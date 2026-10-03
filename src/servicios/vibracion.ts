import * as Haptics from 'expo-haptics';

function seguro(accion: () => Promise<void>) {
  accion().catch(() => {});
}

export const vibrarExito = () =>
  seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

export const vibrarError = () =>
  seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

export const vibrarToque = () =>
  seguro(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
