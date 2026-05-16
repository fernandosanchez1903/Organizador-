import { colorBarra } from '../utils/tareas'

// Escena completa del personaje: ocupa toda la pantalla como fondo fijo.
// z-index 0 → el panel de tareas (z-index 10) lo tapa al hacer scroll.
// El gato está posicionado al ~60% del alto para que quede visible
// sobre el borde superior del panel de tareas (que empieza en 55dvh).
export default function ZonaPersonaje({ vidaGeneral }) {
  return (
    <div
      className="bg-black"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    >
      {/* Barra de salud general pegada al tope */}
      <div className="px-6 pt-5 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-zinc-500 text-xs tracking-wide uppercase">Salud</span>
          <span className="text-zinc-400 text-xs font-medium tabular-nums">{vidaGeneral}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full overflow-hidden" style={{ height: '6px' }}>
          <div
            className={`rounded-full transition-all duration-700 ${colorBarra(vidaGeneral)}`}
            style={{ width: `${vidaGeneral}%`, height: '6px' }}
          />
        </div>
      </div>

      {/* Gato placeholder centrado horizontalmente, a ~60% del alto de pantalla */}
      <div
        style={{ position: 'absolute', top: '58%', left: '50%', transform: 'translate(-50%, -50%)' }}
        className="flex flex-col items-center select-none"
      >
        <span style={{ fontSize: '96px', lineHeight: 1 }} role="img" aria-label="Gato">
          🐱
        </span>
      </div>
    </div>
  )
}
