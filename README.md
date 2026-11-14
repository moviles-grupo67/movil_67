# Reservas Deportivas · Villaguay

App móvil para reservar los espacios deportivos municipales de Villaguay (Entre Ríos):
ver la disponibilidad de cada cancha, reservar un turno, mostrar el QR en la entrada y,
para el personal de la Dirección de Deportes, administrar la agenda, los bloqueos y las
reservas fijas.

Trabajo final de **Desarrollo para Móviles** — Tecnicatura Universitaria en Desarrollo Web,
FCAD · UNER.

## Grupo 67

| Integrante | Parte de la app |
|---|---|
| Demian Nehuen Diak Prediger | Gestión: agenda, bloqueos, reservas fijas, precios |
| Andres Labra | Reservas y código QR |
| Micaela Giselle Ortiz | Cuenta, ingreso y conexión con la API |
| Ezequiel Eduardo Sanchez | Espacios, mapa y notificaciones |

## API

La app usa la API de la cátedra. Para las notificaciones push hicimos un fork, donde
programamos el guardado de los tokens de Expo y el envío de las push
(`src/student-notifications/`):

**https://github.com/moviles-grupo67/api-reservas-deportivas-grupo67**

API original de la cátedra:
https://github.com/franco-ruisdias-uner/api-proyectos-mobile
