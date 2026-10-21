import { bloqueos as bloqueosMock } from "@/src/mocks/bloqueos";
import { Respuesta } from "@/src/tipos/api";
import { Bloqueo } from "@/src/tipos/bloqueo";

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

export type NuevoBloqueo = Omit<Bloqueo, "id" | "creadoPor" | "creadoEn">;

// Simula la obtención de bloqueos desde la API. Se puede filtrar por fecha y/o espacioId.
export async function obtenerBloqueos(filtro?: {
  fecha?: string;
  espacioId?: string;
}): Promise<Respuesta<Bloqueo[]>> {
  await esperar();
  if (configMock.simularErrorDeRed) return ERROR_DE_RED();

  const lista = bloqueosMock.filter(
    (b) =>
      (!filtro?.fecha || b.fecha === filtro.fecha) &&
      (!filtro?.espacioId || b.espacioId === filtro.espacioId),
  );
  return exito(lista);
}

// Representa un bloqueo que se va a crear, sin id ni creador ni fecha de creación (lo crea la API).
export async function crearBloqueo(
  datos: NuevoBloqueo,
  creadoPor: string,
): Promise<Respuesta<Bloqueo>> {
  await esperar();
  if (configMock.simularErrorDeRed) return ERROR_DE_RED();

  if (datos.motivo.trim().length < 3) {
    return fallo("DATOS_INVALIDOS", "Escribí el motivo del bloqueo.");
  }
  if ((datos.inicio === null) !== (datos.fin === null)) {
    return fallo(
      "DATOS_INVALIDOS",
      "Indicá el inicio y el fin, o dejá los dos vacíos para bloquear todo el día.",
    );
  }
  if (
    datos.inicio !== null &&
    datos.fin !== null &&
    datos.fin <= datos.inicio
  ) {
    return fallo("DATOS_INVALIDOS", "El fin tiene que ser después del inicio.");
  }

  // Verifica que no haya un bloqueo superpuesto en el mismo espacio y fecha.
  const desde = datos.inicio ?? "00:00";
  const hasta = datos.fin ?? "24:00";
  const seSuperpone = bloqueosMock.some(
    (b) =>
      b.espacioId === datos.espacioId &&
      b.fecha === datos.fecha &&
      desde < (b.fin ?? "24:00") &&
      hasta > (b.inicio ?? "00:00"),
  );
  if (seSuperpone) {
    return fallo(
      "BLOQUEO_SUPERPUESTO",
      "Ese espacio ya tiene un bloqueo en ese horario.",
    );
  }

  // Crea el bloqueo y lo agrega al mock.
  const nuevo: Bloqueo = {
    ...datos,
    id: `blo-${Date.now()}`,
    creadoPor,
    creadoEn: new Date().toISOString(),
  };
  bloqueosMock.push(nuevo);
  return exito(nuevo);
}

// Simula la eliminación de un bloqueo por id. Devuelve el bloqueo eliminado.
export async function eliminarBloqueo(id: string): Promise<Respuesta<Bloqueo>> {
  await esperar();
  if (configMock.simularErrorDeRed) return ERROR_DE_RED();

  const posicion = bloqueosMock.findIndex((b) => b.id === id);
  if (posicion === -1) {
    return fallo("NO_ENCONTRADO", "No encontramos ese bloqueo.");
  }
  const [eliminado] = bloqueosMock.splice(posicion, 1);
  return exito(eliminado);
}
