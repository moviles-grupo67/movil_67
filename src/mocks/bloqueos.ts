import { Bloqueo } from "@/src/tipos/bloqueo";
import { fechaISO } from "@/src/utils/turnos";

// Fechas relativas a hoy, así el mock no queda vencido con el tiempo.
// Esto devuelve la fecha de hoy + cantidad de días, en formato ISO.
function enDias(cantidad: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + cantidad);
  return fechaISO(fecha);
}

export const bloqueos: Bloqueo[] = [
  // Un sabado de lluvia: un día entero bloqueado.
  {
    id: "blo-01",
    espacioId: "esp-02",
    fecha: enDias(1),
    inicio: null,
    fin: null,
    motivo: "Cancha anegada por la lluvia",
    creadoPor: "usr-501",
    creadoEn: new Date().toISOString(),
  },
  // Un solo turno: mantenimiento de 20 a 21 hs.
  {
    id: "blo-02",
    espacioId: "esp-01",
    fecha: enDias(2),
    inicio: "20:00",
    fin: "21:00",
    motivo: "Cambio de lámparas",
    creadoPor: "usr-900",
    creadoEn: new Date().toISOString(),
  },
];
