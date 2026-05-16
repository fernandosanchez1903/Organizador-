# Checkpoint 2026-05-15

# Checkpoint 2026-05-15

## Estado general
V1 completa y deployada. Rama `v2` en desarrollo activo — rediseño de UI completado, bottom sheet funcional con dos bugs pendientes.

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

## Qué hay en v2 (rama v2) — implementado

### Layout
- `ZonaPersonaje.jsx`: escena completa, `position: fixed`, cubre toda la pantalla, `z-index 0`. Emoji 🐱 al 58% del alto. Barra de salud general (promedio de todas las tareas) pegada al tope. Placeholder listo para reemplazar por GIFs.
- `ZonaTareas.jsx`: panel `position: fixed`, `top: 55dvh` inicial, `z-index 10`, `border-radius 24px` arriba. Tapa visualmente al personaje al subir.
- `App.jsx`: calcula `vidaGeneral` (promedio), ordena tareas por vida ascendente, orquesta los dos componentes.
- `index.css`: `overflow: hidden` en html/body — único scroll posible es dentro de `ZonaTareas`.
- Layout usa `100dvh` / `55dvh` / `15dvh` (dynamic viewport height para iOS).

### TarjetaTarea
- Fila única: `[emoji 32px] [nombre flex-1] [barra vida ~80px] [✏️] [🗑️]`
- Tap en tarjeta = completar con flash verde
- Botones editar/eliminar con `stopPropagation`
- Barra de vida `6px` de altura

### ModalTarea
- Misma lógica de v1, aspecto visual actualizado
- Panel `bg-zinc-900`, inputs con borde explícito, botón confirmar `bg-violet-600`

### Bottom sheet — comportamiento actual
El panel se queda exactamente donde se suelta. Única restricción: si llega a `≤ 15dvh`, se ancla ahí y el scroll de la lista toma control. No hay snap a posición inicial.

**Decisión arquitectónica clave**: `top` del panel no está en el `style` prop de React — se gestiona 100% vía `panelRef.current.style.top` en event listeners para que re-renders de la lista no reseteen la posición. `posicionRef` (ref espejo) evita stale closures.

## Bugs pendientes (v2)
- **Contenido cortado durante drag**: el `overflow-y` del panel corta el contenido mientras se arrastra. Se ve completo al soltar. Fix: gestionar `overflow` durante el drag.
- **Panel se va de pantalla hacia abajo**: no hay límite inferior en el drag. El `top` puede llegar a `100dvh` y el panel desaparece. Fix: clampar `top` máximo a ~`80dvh` durante el drag.

## Bloqueadores actuales
- GIFs del personaje: los hace Bianca, pendientes
- GIFs específicos por tarea: pendiente definir qué tareas tendrán GIF propio

## Pendiente v2
- [x] Rediseño completo de UI (zona personaje + lista compacta + bottom sheet)
- [ ] Fix: contenido cortado durante drag
- [ ] Fix: panel desaparece al arrastrar hacia abajo
- [ ] Lógica `obtenerAsset(nombreTarea, vida)` en utils
- [ ] Swipe para editar/eliminar tarjetas
- [ ] Onboarding swipe (una sola vez)
- [ ] GIFs del personaje (bloqueado — Bianca)
- [ ] GIFs específicos por tarea (bloqueado — Bianca + definir tareas)