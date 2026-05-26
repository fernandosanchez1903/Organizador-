# Checkpoint 2026-05-16

## Estado general
V2 funcionalmente completa. Todo el rediseño implementado y todos los bugs conocidos resueltos. Único bloqueador: assets de Bianca (GIFs del personaje).

## Stack
| Pieza | Versión |
|---|---|
| React | 19.2.5 |
| Vite | 8.0.10 |
| Tailwind CSS | 4.2.4 |
| Persistencia | localStorage (`organizador-tareas`) |

## Qué hay en v2 — completo

### Layout
- `ZonaPersonaje.jsx`: fondo completo fixed, z-index 0. Placeholder emoji 🐱 listo para reemplazar por GIFs.
- `ZonaTareas.jsx`: bottom sheet fixed, z-index 10. Posición libre — sigue el dedo, ancla en `15dvh` arriba y límite en `60dvh` abajo.
- `top` del panel gestionado 100% vía DOM imperativo para que re-renders no reseteen posición.

### TarjetaTarea
- Fila única: emoji + nombre + barra de vida
- Swipe izquierda: eliminar con confirmación + fondo rojo revelándose detrás
- Swipe derecha: editar directo + fondo verde revelándose detrás
- Tap: completar con flash verde
- Sin botones ✏️ y 🗑️

### ModalTarea
- Font-size mínimo 16px en todos los inputs — sin zoom en iOS

### Bugs resueltos en esta sesión
- Contenido cortado durante drag (`overflowY: visible` mientras se arrastra)
- Panel sin límite inferior (clampado a `60dvh`)
- Panel sin `minHeight` (fondo gris no cubría pantalla con pocas tareas)
- Zoom en iOS al abrir modal (font-size < 16px en inputs)

## Bloqueadores
- GIFs del personaje: los hace Bianca, pendientes
- GIFs específicos por tarea: pendiente definir tareas + assets de Bianca
- `obtenerAsset(nombreTarea, vida)`: bloqueado hasta tener los GIFs

## Pendiente v2
- [x] Rediseño completo de UI
- [x] Bottom sheet con drag libre
- [x] Swipe para editar/eliminar
- [x] Feedback visual en swipe
- [x] Fix zoom iOS en modal
- [ ] GIFs del personaje (bloqueado — Bianca)
- [ ] GIFs específicos por tarea (bloqueado — Bianca)
- [ ] `obtenerAsset` en utils (bloqueado — Bianca)
- [ ] Onboarding swipe (descartado hasta que la app salga a producción)

## Ideas v3
- Gamificación (por definir)
