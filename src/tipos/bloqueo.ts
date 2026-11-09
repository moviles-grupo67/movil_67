export interface Bloqueo {
  id: string;
  espacioId: string;
  fecha: string; // "AAAA-MM-DD"
  inicio: string | null; // "HH:MM". null = todo el día
  fin: string | null; // "HH:MM". null = todo el día
  motivo: string;
}
