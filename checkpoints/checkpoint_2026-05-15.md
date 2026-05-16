# Checkpoint 2026-05-15

## Estado general
V1 completa y deployada. Rama `v2` creada, diseño definido, sin código nuevo todavía.

## Stack
| Pieza | Versión |
|---|---|
| React | 19.2.5 |
| Vite | 8.0.10 |
| Tailwind CSS | 4.2.4 |
| Persistencia | localStorage (`organizador-tareas`) |

## Qué hay en v1 (rama master)
- Crear/editar/eliminar tareas
- Barra de vida con colores (verde/amarillo/rojo)
- Sort por vida ascendente
- Estado vacío
- Flash verde al marcar como hecha
- Assets pixel art: 7 personajes × 3 estados, mapeo por nombre normalizado
- PWA instalable (manifest + service worker cache-first, 26 URLs)
- Banner de tareas urgentes al abrir (vida = 0)

## Diseño decidido para v2
- Personaje único (gato animado con GIFs) reemplaza los 7 personajes pixel art
- Vida general = promedio de vida de todas las tareas
- 3 GIFs generales: sano (> 60) / enfermo (>= 30) / muriendo (< 30)
- GIFs específicos por tarea: si la tarea más urgente en < 30 tiene GIF propio, se muestra ese en lugar del general
- UI rediseñada: zona personaje sticky arriba, lista compacta scrolleable abajo
- Tap en tarjeta = marcar como hecha
- Swipe para editar/eliminar (implementar después)
- Onboarding de una sola vez para explicar swipe (implementar después)

## Bloqueadores actuales
- GIFs del personaje: los hace Bianca, pendientes
- GIFs específicos por tarea: pendiente definir qué tareas tendrán GIF propio

## Pendiente v2
- [ ] Rediseño completo de UI
- [ ] Lógica `obtenerAsset(nombreTarea, vida)` en utils
- [ ] Swipe para editar/eliminar
- [ ] Onboarding swipe
- [ ] GIFs del personaje
- [ ] GIFs específicos por tarea
