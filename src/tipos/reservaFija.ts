export interface ReservaFija {
  id: string;
  espacioId: string;
  titular: string;
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  inicio: string;
  fin: string;
  desde: string;
  hasta: string | null;
  activa: boolean;
}
