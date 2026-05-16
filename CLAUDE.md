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
- Rama `v2`: rediseño en desarrollo

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

## Diseño v2
Pantalla única dividida en dos zonas:
1. **Zona personaje (superior, sticky)**: GIF del gato con su escena completa + barra de vida general encima. Se queda fija mientras las tareas scrollean encima tapándola gradualmente.
2. **Zona tareas (inferior, scrolleable)**: lista compacta de tarjetas. Cada tarjeta: emoji + nombre + barra de vida individual en una sola fila. Tap en tarjeta = marcar como hecha. Editar/eliminar via swipe (implementar después).

Botón `+` flotante abajo derecha para crear tareas.

## Pendiente v2
- [ ] Rediseño completo de UI (zona personaje + lista compacta)
- [ ] Lógica `obtenerAsset(nombreTarea, vida)` en utils
- [ ] Swipe para editar/eliminar
- [ ] Onboarding de una sola vez explicando el swipe
- [ ] GIFs del personaje (bloqueado esperando assets de Bianca)
- [ ] GIFs específicos por tarea (bloqueado esperando definir tareas + assets)

## Arquitectura
- **`App.jsx`** — orquesta estado de UI (`modalEstado`) y conecta el hook con los componentes. Sin lógica de negocio.
- **`hooks/useTareas.js`** — único punto de acceso a localStorage. Expone `{ tareas, completarTarea, eliminarTarea, editarTarea, agregarTarea }`. Todos los writes pasan por `actualizarTareas()` que sincroniza React state + localStorage en un solo lugar. Incluye seed de 3 tareas si localStorage está vacío.
- **`utils/tareas.js`** — funciones puras: `calcularVida`, `diasDesde`, `colorBarra`, `esEmoji`, `obtenerImagen`. Ningún componente calcula vida directamente; todo pasa por aquí.
- **Tailwind v4**: configurado vía plugin `@tailwindcss/vite` en `vite.config.js`. No hay `tailwind.config.js`. El único import necesario es `@import "tailwindcss"` en `index.css`.
- **PWA**: `public/manifest.json` + `public/sw.js` (cache-first). El SW se registra solo en producción (`import.meta.env.PROD`) en `main.jsx`.

## Convenciones
- Comentar cada función y componente
- Nombres de variables en español
- Componentes en PascalCase
