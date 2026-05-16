# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos
```bash
npm run dev      # servidor de desarrollo (Vite HMR)
npm run build    # build de producción → dist/
npm run preview  # preview del build en local
npm run lint     # ESLint
```
No hay tests automatizados en el proyecto.

En Windows, si `npm` no está en PATH del shell, usar: `& "C:\Program Files\nodejs\npm.cmd" run <script>`

# Organizador — Tamagotchi de responsabilidades adultas

## Qué es
App personal para gestionar tareas recurrentes de vida adulta. Un gato animado funciona como mascota única cuyo estado visual refleja qué tan al día estás con tus tareas. Inspirado en BitePal y Pou.

## Stack
- React + Vite
- Tailwind CSS v4 (con plugin @tailwindcss/vite)
- localStorage para persistencia (sin backend, sin DB)

## Estado actual
- Rama `master`: v1 completa y deployada en Vercel (organizador-orpin.vercel.app)
- Rama `v2`: rediseño implementado — layout de dos zonas + bottom sheet draggable

## Modelo de datos
Sin cambios respecto a v1. Cada tarea:
```js
{
  id: number,         // Date.now()
  nombre: string,
  emoji: string,
  frecuenciaDias: number,
  ultimaVez: string   // ISO 8601
}
```
Clave localStorage: `'organizador-tareas'`

## Lógica de vida
```js
vida = Math.max(0, Math.round(100 - (diasTranscurridos / frecuenciaDias) * 100))
```
Umbrales: `> 60` verde · `>= 30` amarillo · `< 30` rojo

**Vida general del personaje**: promedio de vida de todas las tareas.

## Sistema de assets del personaje
GIFs animados en `public/assets/personaje/`:
- `sano.gif` — vida general > 60
- `enfermo.gif` — vida general >= 30
- `muriendo.gif` — vida general < 30
- GIFs específicos por tarea pendientes (los genera Bianca)

Lógica de selección: si la tarea más urgente con vida < 30 tiene GIF específico, mostrarlo. Si no, usar el GIF general según promedio.

## Layout v2 (implementado)
Pantalla única dividida en dos zonas con `position: fixed` ambas:
1. **ZonaPersonaje** (`z-index 0`): fondo negro, ocupa toda la pantalla (`top 0` → `bottom 0`). Barra de salud general pegada al tope. Emoji/GIF del gato posicionado al 58% del alto (`position: absolute`). Placeholder listo para reemplazar por GIFs de Bianca.
2. **ZonaTareas** (`z-index 10`): panel `bottom 0`, `border-radius 24px` arriba, fondo `zinc-900`. Empieza en `top: 55dvh` inicial. Es un bottom sheet draggable: el usuario puede arrastrarlo hacia arriba (límite: `15dvh`) o hacia abajo. Al llegar a `15dvh`, se ancla y el scroll de la lista toma control.

`html, body { overflow: hidden }` en `index.css` — el único scroll posible es dentro de ZonaTareas.  
Usar `dvh` (no `vh`) en todas partes para iOS.

Botón `+` flotante (`z-index 50`) abajo derecha.

## Pendiente v2
- [x] Rediseño completo de UI (zona personaje + lista compacta + bottom sheet)
- [ ] Lógica `obtenerAsset(nombreTarea, vida)` en utils (reemplaza `obtenerImagen`)
- [ ] Swipe para editar/eliminar tarjetas
- [ ] Onboarding de una sola vez explicando el swipe
- [ ] GIFs del personaje (bloqueado esperando assets de Bianca)
- [ ] GIFs específicos por tarea (bloqueado esperando definir tareas + assets)

## Arquitectura
- **`App.jsx`** — orquesta estado de UI (`modalEstado`) y conecta el hook con los componentes. Calcula `vidaGeneral` (promedio) y ordena tareas por vida ascendente. Sin lógica de negocio.
- **`hooks/useTareas.js`** — único punto de acceso a localStorage. Expone `{ tareas, completarTarea, eliminarTarea, editarTarea, agregarTarea }`. Todos los writes pasan por `actualizarTareas()` que sincroniza React state + localStorage en un solo lugar. Incluye seed de 3 tareas si localStorage está vacío.
- **`utils/tareas.js`** — funciones puras: `calcularVida`, `diasDesde`, `colorBarra`, `esEmoji`, `obtenerImagen`. Ningún componente calcula vida directamente; todo pasa por aquí.
- **`ZonaPersonaje.jsx`** — fondo fijo de toda la pantalla. Solo recibe `vidaGeneral`. Placeholder para GIFs de Bianca.
- **`ZonaTareas.jsx`** — bottom sheet con drag gesture. **Patrón clave**: el `top` del panel NO está en el `style` prop de React — se gestiona 100% de forma imperativa vía `panelRef.current.style.top` en `useEffect`. Esto evita que los re-renders (al completar/agregar tareas) reseteen la posición del panel. Todo el estado del gesto vive en refs (`gesto`, `posicionRef`). `posicionRef.current`: `'libre'` | `'arriba'` (anclado en `15dvh`).
- **`TarjetaTarea.jsx`** — tarjeta compacta de una fila. Flash verde de 600ms al completar (`completando` state). `stopPropagation` en botones de editar/eliminar para no disparar el complete.
- **Tailwind v4**: configurado vía plugin `@tailwindcss/vite` en `vite.config.js`. No hay `tailwind.config.js`. El único import necesario es `@import "tailwindcss"` en `index.css`.
- **PWA**: `public/manifest.json` + `public/sw.js` (cache-first). El SW se registra solo en producción (`import.meta.env.PROD`) en `main.jsx`.

## Convenciones
- Comentar cada función y componente
- Nombres de variables en español
- Componentes en PascalCase
