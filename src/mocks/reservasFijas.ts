import { ReservaFija } from "@/src/tipos/reservaFija";

export const reservasFijas: ReservaFija[] = [
  // Caso del PDF: todos los martes a las 21, sin fecha de fin.
  {
    id: "fij-01",
    espacioId: "esp-02",
    titular: "Grupo de los martes",
    dia: 2,
    inicio: "21:00",
    fin: "22:00",
    desde: "2026-03-01",
    hasta: null,
    activa: true,
  },
  // Segundo caso: ocupa DOS turnos seguidos (18 y 19 hs), no uno solo.
  {
    id: "fij-02",
    espacioId: "esp-03",
    titular: "Club de básquet — entrenamiento",
    dia: 4,
    inicio: "18:00",
    fin: "20:00",
    desde: "2026-02-01",
    hasta: null,
    activa: true,
  },
  // Tercer caso: ya terminó y está desactivada, la grilla la tiene que ignorar.
  {
    id: "fij-03",
    espacioId: "esp-01",
    titular: "Equipo de los viernes",
    dia: 5,
    inicio: "21:00",
    fin: "22:00",
    desde: "2026-01-10",
    hasta: "2026-06-30",
    activa: false,
  },
];
