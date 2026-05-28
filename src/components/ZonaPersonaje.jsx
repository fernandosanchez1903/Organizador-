import { colorBarra } from '../utils/tareas'

// Devuelve el fondo y GIF del personaje según la vida general.
// Los GIFs de enfermo y muriendo están bloqueados esperando assets de Bianca.
function obtenerAssets(vida) {
  if (vida > 60) {
    return { fondo: '/assets/Personaje/fondo.jpeg', gif: '/assets/Personaje/sano.gif' }
  }
  if (vida >= 30) {
    // TODO: reemplazar gif por '/assets/Personaje/enfermo.gif' cuando Bianca lo entregue
    return { fondo: '/assets/Personaje/fondo_intermedio.jpeg', gif: '/assets/Personaje/sano.gif' }
  }
  // TODO: reemplazar gif por '/assets/Personaje/muriendo.gif' cuando Bianca lo entregue
  return { fondo: '/assets/Personaje/fondo_final.jpeg', gif: '/assets/Personaje/sano.gif' }
}

// Escena completa del personaje: ocupa toda la pantalla como fondo fijo.
// z-index 0 → el panel de tareas (z-index 10) lo tapa al hacer scroll.
// El gato está posicionado al 32% del alto para que quede visible
// sobre el borde superior del panel de tareas (que empieza en 55dvh).
export default function ZonaPersonaje({ vidaGeneral }) {
  // Fondo y GIF cambian según el estado de salud general
  const { fondo, gif } = obtenerAssets(vidaGeneral)

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    >
      {/* Fondo de escena — cubre toda la zona fija */}
      <img
        src={fondo}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top',
          zIndex: 0,
        }}
      />

      {/* Barra de salud general pegada al tope, sobre el fondo */}
      <div className="relative px-6 pt-5 flex flex-col gap-1.5" style={{ zIndex: 1, paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)' }}>
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
        src={gif}
        alt="Gato"
        style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '60%',
          zIndex: 1,
        }}
      />
    </div>
  )
}
