import { Espacio } from '@/src/tipos/espacio';
import { Reserva } from '@/src/tipos/reserva';
import { fechaClave, inicioDeTurno, textoHora } from '@/src/utils/turnos';

export type MotivoRechazo =
  | 'CANCELADA'
  | 'YA_INGRESO'
  | 'AUSENTE'
  | 'OTRO_COMPLEJO'
  | 'OTRO_DIA';

export type ResultadoIngreso =
  | { valido: true }
  | { valido: false; codigo: MotivoRechazo; mensaje: string };

const rechazo = (codigo: MotivoRechazo, mensaje: string): ResultadoIngreso => ({
  valido: false,
  codigo,
  mensaje,
});

export function validarIngreso(
  reserva: Reserva,
  espacioDeLaReserva: Espacio,
  complejoActual: string,
  ahora: Date,
): ResultadoIngreso {
  if (reserva.estado === 'cancelada') {
    return rechazo('CANCELADA', 'Esta reserva fue cancelada.');
  }
  if (reserva.estado === 'cumplida' || reserva.ingresoEn !== null) {
    return rechazo('YA_INGRESO', 'Esta reserva ya registró su ingreso.');
  }
  if (reserva.estado === 'ausente') {
    return rechazo('AUSENTE', 'Esta reserva fue marcada como ausente.');
  }

  if (espacioDeLaReserva.complejo !== complejoActual) {
    const hora = textoHora(inicioDeTurno(reserva.turnoId));
    return rechazo(
      'OTRO_COMPLEJO',
      `Esta reserva es de ${espacioDeLaReserva.nombre}, en ${espacioDeLaReserva.complejo}, a las ${hora}.`,
    );
  }

  const fechaDelTurno = fechaClave(inicioDeTurno(reserva.turnoId));
  if (fechaDelTurno !== fechaClave(ahora)) {
    return rechazo('OTRO_DIA', 'Esta reserva no es para hoy.');
  }

  return { valido: true };
}
