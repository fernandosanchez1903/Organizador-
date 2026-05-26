import { colorBarra } from '../utils/tareas'

// Escena completa del personaje: ocupa toda la pantalla como fondo fijo.
// z-index 0 → el panel de tareas (z-index 10) lo tapa al hacer scroll.
// El gato está posicionado al 42% del alto para que quede visible
// sobre el borde superior del panel de tareas (que empieza en 55dvh).
export default function ZonaPersonaje({ vidaGeneral }) {
  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    >
      {/* Fondo de escena — cubre toda la zona fija */}
      <img
        src="/assets/Personaje/fondo.jpeg"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Barra de salud general pegada al tope, sobre el fondo */}
      <div className="relative px-6 pt-5 flex flex-col gap-1.5" style={{ zIndex: 1 }}>
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

      {/* GIF del gato centrado horizontalmente, a 42% del alto */}
      <img
        src="/assets/Personaje/sano.gif"
        alt="Gato"
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '60%',
          zIndex: 1,
        }}
      />
    </div>
  )
}
