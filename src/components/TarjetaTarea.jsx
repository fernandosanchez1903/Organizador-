import { useState } from 'react'
import { diasDesde, colorBarra } from '../utils/tareas'

// SVG inline en lugar de imagen para poder controlar color con CSS (stroke="currentColor").
function IconoBasura() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

// SVG inline por la misma razón que IconoBasura: color heredado vía currentColor.
function IconoLapiz() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

// Muestra el estado visual de una tarea: emoji, nombre, frecuencia, barra de vida
// y botón "✓ Hecho". Recibe la vida ya calculada como prop — no la computa internamente.
export default function TarjetaTarea({ nombre, emoji, vida, frecuenciaDias, ultimaVez, onCompletar, onEliminar, onEditar }) {
  const dias = diasDesde(ultimaVez)

  // true durante los 600ms del flash verde; impide clics adicionales mientras está activo.
  const [completando, setCompletando] = useState(false)

  // Activa el flash verde, espera 600ms y luego llama a onCompletar para actualizar el estado.
  // El orden importa: primero el efecto visual, luego la mutación de datos.
  function handleCompletar() {
    if (completando) return
    setCompletando(true)
    setTimeout(() => onCompletar(), 600)
  }

  // stopPropagation necesario porque el div padre puede recibir clics y ambos botones
  // están dentro de él; sin esto el evento burbujearía hacia arriba.
  function handleEliminar(e) {
    e.stopPropagation()
    if (window.confirm(`¿Eliminar "${nombre}"?`)) onEliminar()
  }

  function handleEditar(e) {
    e.stopPropagation()
    onEditar()
  }

  return (
    // bg-green-900 reemplaza bg-zinc-800 durante el flash; transition-colors anima el cambio
    <div className={`relative rounded-2xl p-6 flex flex-col gap-4 border border-zinc-700 transition-colors hover:border-zinc-600 ${completando ? 'bg-green-900' : 'bg-zinc-800'}`}>
      <button
        onClick={handleEditar}
        aria-label={`Editar ${nombre}`}
        className="absolute top-3 left-3 p-1.5 text-zinc-600 hover:text-violet-400 hover:bg-zinc-700 rounded-lg transition-colors"
      >
        <IconoLapiz />
      </button>
      <button
        onClick={handleEliminar}
        aria-label={`Eliminar ${nombre}`}
        className="absolute top-3 right-3 p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
      >
        <IconoBasura />
      </button>

      <div className="text-5xl text-center">{emoji}</div>
      <p className="text-white font-semibold text-center text-lg leading-tight">{nombre}</p>
      <p className="text-zinc-500 text-xs text-center">
        Cada {frecuenciaDias} días · completado {dias === 0 ? 'hoy' : `hace ${dias}d`}
      </p>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Vida</span>
          <span>{vida}%</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${colorBarra(vida)}`}
            style={{ width: `${vida}%` }}
          />
        </div>
      </div>

      <button
        onClick={handleCompletar}
        disabled={completando}
        className="w-full mt-1 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 active:scale-95 text-zinc-300 hover:text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ✓ Hecho
      </button>
    </div>
  )
}
