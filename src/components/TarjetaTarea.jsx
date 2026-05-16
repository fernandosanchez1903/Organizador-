import { useState } from 'react'
import { colorBarra } from '../utils/tareas'

// SVG inline para heredar color via currentColor.
function IconoLapiz() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconoBasura() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

// Tarjeta compacta de una sola fila: [emoji] [nombre] [barra vida] [editar] [eliminar]
// Tap en el área principal (emoji + nombre) = completar tarea con flash verde.
// Los botones de acción usan stopPropagation para no disparar el complete.
export default function TarjetaTarea({ nombre, emoji, vida, onCompletar, onEliminar, onEditar }) {
  // true durante los 600ms del flash verde; bloquea taps adicionales.
  const [completando, setCompletando] = useState(false)

  // Activa el flash, espera 600ms, resetea el estado local y actualiza los datos.
  // React 18 batchea setCompletando(false) + onCompletar() en un solo render.
  function handleCompletar() {
    if (completando) return
    setCompletando(true)
    setTimeout(() => {
      setCompletando(false)
      onCompletar()
    }, 600)
  }

  function handleEliminar(e) {
    e.stopPropagation()
    if (window.confirm(`¿Eliminar "${nombre}"?`)) onEliminar()
  }

  function handleEditar(e) {
    e.stopPropagation()
    onEditar()
  }

  return (
    <li
      onClick={handleCompletar}
      className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all cursor-pointer select-none
        ${completando
          ? 'bg-green-950 border-green-800'
          : 'bg-zinc-800 border-zinc-700 active:scale-[0.98]'
        }`}
    >
      {/* Emoji de la tarea */}
      <span className="text-[32px] leading-none shrink-0">{emoji}</span>

      {/* Nombre crece para ocupar el espacio disponible */}
      <span className="flex-1 text-white text-base font-medium truncate">{nombre}</span>

      {/* Barra de vida individual, ancho fijo ~80px */}
      <div className="w-20 shrink-0 flex flex-col gap-1">
        <div className="w-full bg-zinc-700 rounded-full h-[6px] overflow-hidden">
          <div
            className={`h-[6px] rounded-full transition-all duration-500 ${colorBarra(vida)}`}
            style={{ width: `${vida}%` }}
          />
        </div>
        <span className="text-zinc-500 text-[10px] text-right tabular-nums">{vida}%</span>
      </div>

      {/* Botones de acción secundarios: stopPropagation evita disparar el complete */}
      <button
        onClick={handleEditar}
        aria-label={`Editar ${nombre}`}
        className={`shrink-0 p-1.5 rounded-lg text-zinc-600 hover:text-violet-400 hover:bg-zinc-700 transition-colors
          ${completando ? 'pointer-events-none' : ''}`}
      >
        <IconoLapiz />
      </button>
      <button
        onClick={handleEliminar}
        aria-label={`Eliminar ${nombre}`}
        className={`shrink-0 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-700 transition-colors
          ${completando ? 'pointer-events-none' : ''}`}
      >
        <IconoBasura />
      </button>
    </li>
  )
}
