import { calcularVida } from '../utils/tareas'
import TarjetaTarea from './TarjetaTarea'

// Zona inferior como bottom sheet: arranca en 45vh y sube al hacer scroll,
// tapando físicamente al personaje. z-index 10 > z-index 0 de la zona personaje.
export default function ZonaTareas({ tareas, onCompletar, onEliminar, onEditar }) {
  return (
    <div
      className="fixed left-0 right-0 bottom-0 bg-zinc-900 overflow-y-auto"
      style={{ top: '55dvh', zIndex: 10, borderRadius: '24px 24px 0 0' }}
    >
      {/* Header sticky dentro del scroll: se queda arriba al bajar la lista */}
      <div className="sticky top-0 bg-zinc-900 px-5 pt-5 pb-3 z-10">
        <h2 className="text-white font-semibold text-base tracking-tight">Tareas</h2>
      </div>

      {tareas.length === 0 ? (
        // Estado vacío centrado en el espacio disponible
        <div className="flex flex-col items-center justify-center gap-1 py-14 px-8 text-center">
          <p className="text-zinc-400 text-sm">Agrega tu primera tarea</p>
          <p className="text-zinc-600 text-xs mt-1">
            Usa el botón <span className="text-violet-400 font-bold">+</span> de abajo
          </p>
        </div>
      ) : (
        // pb-28 para que la última tarjeta no quede tapada por el botón +
        <ul className="px-4 pb-28 flex flex-col gap-2">
          {tareas.map((tarea) => (
            <TarjetaTarea
              key={tarea.id}
              nombre={tarea.nombre}
              emoji={tarea.emoji}
              vida={calcularVida(tarea.ultimaVez, tarea.frecuenciaDias)}
              frecuenciaDias={tarea.frecuenciaDias}
              ultimaVez={tarea.ultimaVez}
              onCompletar={() => onCompletar(tarea.id)}
              onEliminar={() => onEliminar(tarea.id)}
              onEditar={() => onEditar(tarea)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
