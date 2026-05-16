import { colorBarra } from '../utils/tareas'

// Zona superior fija: personaje (gato placeholder) + barra de vida general.
// z-index 0 para que la zona de tareas al hacer scroll lo tape físicamente.
export default function ZonaPersonaje({ vidaGeneral, hayTareas }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 flex flex-col bg-zinc-950"
      style={{ height: '45dvh', zIndex: 0 }}
    >
      {/* Barra de vida general pegada al tope con padding razonable */}
      <div className="px-6 pt-5 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-zinc-500 text-xs tracking-wide uppercase">Salud</span>
          <span className="text-zinc-400 text-xs font-medium tabular-nums">{vidaGeneral}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${colorBarra(vidaGeneral)}`}
            style={{ width: `${vidaGeneral}%` }}
          />
        </div>
      </div>

      {/* Personaje centrado en el espacio restante */}
      <div className="flex-1 flex flex-col items-center justify-center select-none">
        {/* Placeholder hasta que lleguen los GIFs de Bianca */}
        <span style={{ fontSize: '96px', lineHeight: 1 }} role="img" aria-label="Gato">
          🐱
        </span>
        {!hayTareas && (
          <p className="text-zinc-600 text-sm mt-3">Todo tranquilo por aquí</p>
        )}
      </div>
    </div>
  )
}
