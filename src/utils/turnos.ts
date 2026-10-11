//Esta seccion la agregue para poder darle formato a las fechas de hoy hasta 5 dias agregue. Esto se importa en servicios -> reservas

// Esta funcion lo q hce es convertir la fecha en numeros para insertalo como id eventualmente
export function fechaClave(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}${mes}${dia}`;
}

// Esto arma el id
export function crearTurnoId(espacioId: string, fecha: Date, hora: number): string {
  return `tur-${espacioId}-${fechaClave(fecha)}-${String(hora).padStart(2, '0')}`;
}

// Toma el id y lo que hace es destructurarlo para leerlo
export function inicioDeTurno(turnoId: string): Date {
  const partes = turnoId.split('-');
  const fecha = partes[partes.length - 2];
  const hora = Number(partes[partes.length - 1]);
  return new Date(
    Number(fecha.slice(0, 4)),
    Number(fecha.slice(4, 6)) - 1,
    Number(fecha.slice(6, 8)),
    hora
  );
}

export const CUATRO_HORAS = 1000 * 60 * 60 * 4;
const dos = (n: number) => String(n).padStart(2, '0');

//Formato debe ser de 24 horas
export function textoHora(fecha: Date): string {
  return `${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

// "09/10"
export function textoDia(fecha: Date): string {
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}`;
}

// Esto es para mostrar dia, dia/mes y hora 
export function textoTurno(turnoId: string): string {
  const inicio = inicioDeTurno(turnoId);
  const diaSemana = inicio.toLocaleDateString('es-AR', { weekday: 'long' });
  const dia = textoDia(inicio);
  const hora = inicio.getHours();
  return `${diaSemana[0].toUpperCase()}${diaSemana.slice(1)} ${dia} de ${hora} a ${hora + 1} hs`;
}