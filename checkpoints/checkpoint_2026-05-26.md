# Checkpoint 2026-05-26

## Estado general
V2 con assets reales integrados. Fondo ilustrado y GIF del gato sano funcionando. Panel de tareas semi-transparente. Pendiente: GIFs de estados enfermo y muriendo (Bianca).

## Stack
| Pieza | Versión |
|---|---|
| React | 19.2.5 |
| Vite | 8.0.10 |
| Tailwind CSS | 4.2.4 |
| Persistencia | localStorage (`organizador-tareas`) |

## Assets integrados
- `public/assets/Personaje/fondo.jpg` — fondo ilustrado de la escena
- `public/assets/Personaje/sano.gif` — GIF del gato con transparencia, sin marca de agua

## Cambios de hoy

### ZonaPersonaje.jsx
- Fondo real: `<img>` con `object-fit: cover` y `object-position: top`
- Gato real: `<img src="/assets/Personaje/sano.gif">` en `top: 32%`, `maxWidth: 60%`, transparencia intacta
- `paddingTop: calc(env(safe-area-inset-top) + 1.25rem)` en barra de salud para compensar barra de estado iOS

### ZonaTareas.jsx
- Panel semi-transparente: `rgba(0, 0, 0, 0.75)` en lugar de `bg-zinc-900`
- Header sticky con mismo fondo para consistencia al hacer scroll

### index.html
- `viewport-fit=cover` agregado al meta viewport para soporte de safe area en iOS

### Procesamiento de assets (fuera del repo)
- GIF recortado al contenido del gato (espacios sobrantes eliminados)
- Marca de agua FlipaClip removida

## Bloqueadores
- `enfermo.gif` — pendiente Bianca
- `muriendo.gif` — pendiente Bianca
- `obtenerAsset(nombreTarea, vida)` — bloqueado hasta tener todos los GIFs

## Pendiente v2
- [x] Assets reales integrados (fondo + gato sano)
- [x] Safe area iOS
- [x] Panel semi-transparente
- [ ] `enfermo.gif` y `muriendo.gif` (bloqueado — Bianca)
- [ ] `obtenerAsset` en utils (bloqueado — Bianca)

## Ideas v3
- Scroll en toda la pantalla arrastra el panel (no solo desde el panel)
- Gamificación (por definir)
