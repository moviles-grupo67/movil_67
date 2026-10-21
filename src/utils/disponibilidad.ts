import { Bloqueo } from '@/src/tipos/bloqueo';
import { ReservaFija } from '@/src/tipos/reservaFija';
import { fechaISO } from '@/src/utils/turnos';

const hh = (hora: number) => `${String(hora).padStart(2, '0')}:00`;

export function estaBloqueado(bloqueos: Bloqueo[], espacioId: string, fecha: Date, hora: number) {
  const dia = fechaISO(fecha);
  return bloqueos.some((b) =>
    b.espacioId === espacioId &&
    b.fecha === dia &&
    hh(hora) < (b.fin ?? '24:00') &&
    hh(hora + 1) > (b.inicio ?? '00:00'));
}

export function esFijo(fijas: ReservaFija[], espacioId: string, fecha: Date, hora: number) {
  const dia = fechaISO(fecha);
  return fijas.some((f) =>
    f.activa &&
    f.espacioId === espacioId &&
    f.dia === fecha.getDay() &&
    f.desde <= dia && dia <= (f.hasta ?? '9999-12-31') &&
    hh(hora) < f.fin && hh(hora + 1) > f.inicio);
}