import { reservasFijas as reservasFijasMock } from "@/src/mocks/reservasFijas";
import { Respuesta } from "@/src/tipos/api";
import { ReservaFija } from "@/src/tipos/reservaFija";

const LATENCIA_MS = 400;
const esperar = () =>
  new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));

export const configMock = { simularErrorDeRed: false };

const fallo = (codigo: string, mensaje: string) => ({
  error: { codigo, mensaje },
});
const exito = <T>(datos: T) => ({ datos, meta: null });

const ERROR_DE_RED = () =>
  fallo("ERROR_DE_RED", "No hay conexión. Probá de nuevo en un momento.");

export type NuevaReservaFija = Omit<ReservaFija, "id" | "activa">;

const SIN_FIN = "9999-12-31"; // Representa una fecha "infinita" para comparar reservas fijas que no tienen fecha de fin.

// Valida que una hora esté en formato HH:MM y que sea entre 00:00 y 24:00.
const horaValida = (hora: string) =>
  /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/.test(hora);
const fechaValida = (fecha: string) => /^\d{4}-\d{2}-\d{2}$/.test(fecha);

// Determina si dos reservas fijas se superponen en el mismo espacio y día.
function chocan(a: NuevaReservaFija, b: ReservaFija): boolean {
  return (
    b.activa &&
    a.espacioId === b.espacioId &&
    a.dia === b.dia &&
    a.inicio < b.fin &&
    a.fin > b.inicio &&
    a.desde <= (b.hasta ?? SIN_FIN) &&
    (a.hasta ?? SIN_FIN) >= b.desde
  );
}

// Valida los datos de una nueva reserva fija. Devuelve null si son válidos, o un objeto de error si no lo son.
function validar(datos: NuevaReservaFija, ignorarId?: string) {
  if (datos.titular.trim().length < 2) {
    return fallo(
      "DATOS_INVALIDOS",
      "Escribí quién es el titular de la reserva.",
    );
  }
  if (!horaValida(datos.inicio) || !horaValida(datos.fin)) {
    return fallo("DATOS_INVALIDOS", "Las horas tienen que ser como 21:00.");
  }
  if (datos.inicio < "08:00") {
    return fallo("DATOS_INVALIDOS", "Los turnos arrancan a las 08:00.");
  }
  if (datos.fin <= datos.inicio) {
    return fallo("DATOS_INVALIDOS", "El fin tiene que ser después del inicio.");
  }
  if (!fechaValida(datos.desde) || (datos.hasta && !fechaValida(datos.hasta))) {
    return fallo(
      "DATOS_INVALIDOS",
      "Las fechas tienen que ser como 2026-03-01.",
    );
  }
  if (datos.hasta && datos.hasta < datos.desde) {
    return fallo(
      "DATOS_INVALIDOS",
      "La fecha de fin no puede ser anterior al inicio.",
    );
  }
  const choca = reservasFijasMock.some(
    (otra) => otra.id !== ignorarId && chocan(datos, otra),
  );
  if (choca) {
    return fallo(
      "FIJA_SUPERPUESTA",
      "Ese espacio ya tiene una reserva fija en ese día y horario.",
    );
  }
  return null;
}

// Simula la obtención de reservas fijas desde la API. Se puede filtrar por espacioId y/o soloActivas.
export async function obtenerReservasFijas(filtro?: {
  espacioId?: string;
  soloActivas?: boolean;
}): Promise<Respuesta<ReservaFija[]>> {
  await esperar();
  if (configMock.simularErrorDeRed) return ERROR_DE_RED();

  const lista = reservasFijasMock.filter(
    (f) =>
      (!filtro?.espacioId || f.espacioId === filtro.espacioId) &&
      (!filtro?.soloActivas || f.activa),
  );
  return exito(lista);
}

export async function crearReservaFija(
  datos: NuevaReservaFija,
): Promise<Respuesta<ReservaFija>> {
  await esperar();
  if (configMock.simularErrorDeRed) return ERROR_DE_RED();

  const error = validar(datos);
  if (error) return error;

  const nueva: ReservaFija = {
    ...datos,
    id: `fij-${Date.now()}`,
    activa: true,
  };
  reservasFijasMock.push(nueva);
  return exito(nueva);
}

export async function editarReservaFija(
  id: string,
  cambios: Partial<NuevaReservaFija>,
): Promise<Respuesta<ReservaFija>> {
  await esperar();
  if (configMock.simularErrorDeRed) return ERROR_DE_RED();

  const actual = reservasFijasMock.find((f) => f.id === id);
  if (!actual)
    return fallo("NO_ENCONTRADO", "No encontramos esa reserva fija.");

  const error = validar({ ...actual, ...cambios }, id);
  if (error) return error;

  Object.assign(actual, cambios);
  return exito(actual);
}

// Desactiva una reserva fija por id. No la elimina, solo la marca como inactiva.
export async function desactivarReservaFija(
  id: string,
): Promise<Respuesta<ReservaFija>> {
  await esperar();
  if (configMock.simularErrorDeRed) return ERROR_DE_RED();

  const actual = reservasFijasMock.find((f) => f.id === id);
  if (!actual)
    return fallo("NO_ENCONTRADO", "No encontramos esa reserva fija.");

  actual.activa = false;
  return exito(actual);
}
