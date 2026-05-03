# Checkpoint 2025-05-02

## Estado general

App funcional en desarrollo local. Sin backend, sin autenticación. Todo el estado vive en `localStorage`.

---

## Stack

| Pieza | Versión |
|---|---|
| React | 19.2.5 |
| Vite | 8.0.10 |
| Tailwind CSS | 4.2.4 (plugin `@tailwindcss/vite`, sin `tailwind.config.js`) |
| Persistencia | `localStorage` (`organizador-tareas`) |

---

## Estructura de archivos relevantes

```
src/
  App.jsx       — toda la lógica y UI
  App.css       — vacío (estilos 100% Tailwind)
  index.css     — solo @import "tailwindcss"
  main.jsx      — punto de entrada React estándar
```

---

## Modelo de datos

Cada tarea es un objeto plano guardado en un array JSON en `localStorage`:

```js
{
  id: number,          // Date.now() al crear
  nombre: string,
  emoji: string,
  frecuenciaDias: number,
  ultimaVez: string    // ISO 8601
}
```

**Clave localStorage:** `'organizador-tareas'`

**Seed inicial** (solo si localStorage está vacío): lavar ropa, limpiar depa, pagar tarjeta — todas con `ultimaVez` hace 2 días.

---

## Lógica de vida

```js
vida = Math.max(0, Math.round(100 - (diasTranscurridos / frecuenciaDias) * 100))
```

- `diasTranscurridos` = milisegundos desde `ultimaVez` dividido entre `86_400_000`
- Resultado: entero 0–100, nunca negativo
- Umbrales de color: `> 60` → verde · `>= 30` → amarillo · `< 30` → rojo

---

## Componentes

### `TarjetaTarea`
- Muestra: emoji, nombre, subtítulo (frecuencia + días desde última vez), barra de vida, botón "✓ Hecho"
- Ícono lápiz (esquina sup. izq.) → abre modal de edición
- Ícono basura (esquina sup. der.) → `window.confirm` + elimina
- Botón "✓ Hecho" (pie de tarjeta) → único trigger para marcar completada; actualiza `ultimaVez` a `now`
- La tarjeta en sí **no** es clickeable

### `ModalTarea`
- Modo **crear** (`tareaInicial = null`): form vacío, título "Nueva tarea"
- Modo **editar** (`tareaInicial = <objeto>`): form pre-llenado, título "Editar tarea"
- Campos: nombre (required), emoji (opcional, default `📝`), frecuencia en días (required, min 1)
- Validación emoji: `/\p{Extended_Pictographic}/u` — rechaza texto normal con mensaje de error inline
- Cierra al hacer clic en el overlay o en Cancelar
- **Editar no resetea `ultimaVez`**

### `App`
- Estado: `tareas[]`, `modalAbierto: boolean`, `tareaEditando: tarea | null`
- FAB "+" (esquina inf. der., violet) abre modal de creación
- Toda mutación escribe en localStorage inmediatamente

---

## Decisiones técnicas registradas

- **Sin `tailwind.config.js`**: Tailwind v4 con plugin de Vite no lo necesita.
- **Colores de barra con clases completas**: las clases `bg-green-500`, `bg-yellow-400`, `bg-red-500` están hardcodeadas como strings completos en `colorBarra()` para que Tailwind las incluya en el bundle.
- **`cargarTareas` pasado como lazy initializer** a `useState` para leer localStorage solo una vez al montar.
- **ID = `Date.now()`**: suficiente para uso personal single-tab sin riesgo de colisión.
- **`window.confirm` para eliminar**: simple, sin estado adicional.

---

## Pendiente / ideas anotadas

- Ordenar tarjetas por vida ascendente (las más urgentes primero)
- Animación al marcar como hecha (flash verde)
- Estado vacío cuando no hay tareas
- Assets pixel art por tarea
- Notificaciones cuando una tarea llega a 0%
