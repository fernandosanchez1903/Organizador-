# Checkpoint 2025-05-06

## Estado general

App funcional en desarrollo local. Sin backend, sin autenticación. Todo el estado vive en `localStorage`. El código está completamente refactorizado en módulos separados.

---

## Stack

| Pieza | Versión |
|---|---|
| React | 19.2.5 |
| Vite | 8.0.10 |
| Tailwind CSS | 4.2.4 (plugin `@tailwindcss/vite`, sin `tailwind.config.js`) |
| Persistencia | `localStorage` (`organizador-tareas`) |

---

## Estructura de archivos

```
src/
  App.jsx                    — orquestación: conecta hook + estado UI + layout
  App.css                    — vacío (estilos 100% Tailwind)
  index.css                  — solo @import "tailwindcss"
  main.jsx                   — punto de entrada React estándar
  hooks/
    useTareas.js             — único punto de mutación de datos y persistencia
  utils/
    tareas.js                — funciones puras: calcularVida, diasDesde, colorBarra, esEmoji
  components/
    TarjetaTarea.jsx         — tarjeta de tarea + IconoBasura + IconoLapiz (SVG inline)
    ModalTarea.jsx           — modal dual crear/editar
```

---

## Modelo de datos

Cada tarea es un objeto plano guardado en un array JSON en `localStorage`:

```js
{
  id: number,           // Date.now() al crear
  nombre: string,
  emoji: string,
  frecuenciaDias: number,
  ultimaVez: string     // ISO 8601
}
```

**Clave localStorage:** `'organizador-tareas'`

**Seed inicial** (solo si localStorage está vacío): lavar ropa (cada 3d), limpiar depa (cada 7d), pagar tarjeta (cada 30d) — todas con `ultimaVez` hace 2 días.

---

## Lógica de vida

```js
vida = Math.max(0, Math.round(100 - (diasTranscurridos / frecuenciaDias) * 100))
```

- `diasTranscurridos` = `(Date.now() - new Date(ultimaVez).getTime()) / 86_400_000`
- Resultado: entero 0–100, nunca negativo
- Umbrales de color: `> 60` → verde · `>= 30` → amarillo · `< 30` → rojo (30 exacto es amarillo)

---

## Componentes y responsabilidades

### `App`
- Orquesta estado de UI (`modalEstado`) y conecta `useTareas` con los componentes visuales
- No contiene lógica de negocio ni acceso directo a localStorage
- `modalEstado`: `null` = sin modal · `'crear'` = modal nueva tarea · `{ ...tarea }` = modal edición

### `TarjetaTarea`
- Muestra: emoji, nombre, subtítulo (frecuencia + días desde última vez), barra de vida, botón "✓ Hecho"
- Ícono lápiz (esquina sup. izq., violet al hover) → abre modal edición
- Ícono basura (esquina sup. der., rojo al hover) → `window.confirm` + elimina
- Botón "✓ Hecho" (pie) → único trigger para marcar completada
- Recibe `vida` ya calculada como prop; no la computa internamente
- La tarjeta en sí **no** es clickeable (es un `<div>`, no un `<button>`)

### `ModalTarea`
- Modo **crear** (`tareaInicial = null`): form vacío, título "Nueva tarea"
- Modo **editar** (`tareaInicial = objeto`): form pre-llenado, título "Editar tarea"
- Campos: nombre (required), emoji (opcional, default `📝`), frecuencia en días (required, min 1)
- Validación emoji: `/\p{Extended_Pictographic}/u` — rechaza texto con mensaje de error inline
- Cierra al hacer clic en el overlay o en Cancelar
- **Editar no resetea `ultimaVez`**

---

## Decisiones técnicas

- **`useTareas` como único punto de mutación**: `actualizarTareas` centraliza `setState` + `persistir` para que nunca queden desincronizados. Ningún componente llama a `localStorage` directamente.
- **`modalEstado` unificado**: un solo `useState` reemplaza `modalAbierto: boolean` + `tareaEditando: tarea | null`. El tipo del valor distingue el modo: `null` / `'crear'` / objeto tarea.
- **`calcularVida` en `App`, no en `TarjetaTarea`**: App la computa al mapear y la pasa como prop; el componente visual no sabe cómo se calcula.
- **SVG inline para iconos**: permite heredar color vía `currentColor` sin necesidad de librería de iconos.
- **Sin `tailwind.config.js`**: Tailwind v4 con plugin de Vite no lo necesita.
- **Clases de color hardcodeadas como strings completos** en `colorBarra()` para que Tailwind las incluya en el bundle (no soporta clases dinámicas parciales).
- **`cargarTareas` como lazy initializer** de `useState`: lee localStorage una sola vez al montar.
- **ID = `Date.now()`**: suficiente para uso personal single-tab.
- **`window.confirm` para eliminar**: simple, sin estado adicional ni modal extra.
- **`formVacio` fuera del componente** `ModalTarea`: evita que se recree como objeto nuevo en cada render.

---

## Pendiente / ideas anotadas

- Ordenar tarjetas por vida ascendente (las más urgentes primero)
- Animación al marcar como hecha (flash verde)
- Estado vacío cuando no hay tareas
- Assets pixel art por tarea
- Notificaciones cuando una tarea llega a 0%
