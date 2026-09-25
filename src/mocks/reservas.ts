import { Reserva } from '@/src/tipos/reserva';

export const reservas: Reserva[] = [
    {
    id: 'res-1180',
    turnoId: 'tur-0219-19',
    espacioId: 'esp-02',
    usuarioId: 'usr-207',
    cantidadPersonas: 10,
    codigoQr: 'VGY-1180-0219-19',
    estado: 'confirmada',
    ingresoEn: null,
    creadaEn: '2026-09-16T21:04:00-03:00',
    cancelableHasta: '2026-09-19T15:00:00-03:00',
  },
  {
    id: 'res-1150',
    turnoId: 'tur-0912-21',
    espacioId: 'esp-01',
    usuarioId: 'usr-207',
    cantidadPersonas: 8,
    codigoQr: 'VGY-1150-0912-21',
    estado: 'cumplida',
    ingresoEn: '2026-09-12T21:03:00-03:00',
    creadaEn: '2026-09-10T18:00:00-03:00',
    cancelableHasta: '2026-09-12T17:00:00-03:00',
  },
]