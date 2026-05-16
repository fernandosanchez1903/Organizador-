import { useRef, useState, useEffect } from 'react'
import { calcularVida } from '../utils/tareas'
import TarjetaTarea from './TarjetaTarea'

// Dos posiciones de snap. El panel nunca se mueve píxel a píxel —
// solo hace snap entre estos dos valores con una transición CSS.
const POSICION_ABAJO = '55dvh'
const POSICION_ARRIBA = '15dvh'

// Panel con scroll que controla su propia posición vertical.
// El scroll hace dos cosas en secuencia:
//   1. Swipe arriba → sube el panel de 55dvh a 15dvh
//   2. Ya arriba → scrollea el contenido de la lista normal
// Swipe abajo en scrollTop 0 → baja el panel de 15dvh a 55dvh
export default function ZonaTareas({ tareas, onCompletar, onEliminar, onEditar }) {
  // 'abajo' | 'arriba' — determina el valor de top del panel
  const [posicion, setPosicion] = useState('abajo')

  const panelRef = useRef(null)

  // Ref espejo de posicion para leer el valor fresco dentro de los event listeners
  // sin necesidad de re-registrarlos en cada cambio de estado.
  const posicionRef = useRef('abajo')

  // Estado del gesto activo; se resetea en cada touchstart.
  const gesto = useRef({
    startY: 0,
    snapDisparado: false, // true una vez que actuamos en el gesto; ignora touchmoves siguientes
  })

  // Actualiza tanto el estado React (para re-render) como el ref (para los listeners).
  function actualizarPosicion(nueva) {
    posicionRef.current = nueva
    setPosicion(nueva)
  }

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    // Registra la posición Y del primer toque y resetea la bandera de snap.
    function onTouchStart(e) {
      gesto.current.startY = e.touches[0].clientY
      gesto.current.snapDisparado = false
    }

    // Decide en cada frame si el gesto debe mover el panel o scrollear la lista.
    // Una vez disparado el snap, ignora el resto del gesto para no interferir
    // con la animación CSS ni con el scroll posterior.
    function onTouchMove(e) {
      if (gesto.current.snapDisparado) return

      const deltaY = e.touches[0].clientY - gesto.current.startY
      const scrollTop = panel.scrollTop

      if (posicionRef.current === 'abajo' && deltaY < 0) {
        // Gesto hacia arriba con panel en 55dvh → subir panel, bloquear scroll de lista
        e.preventDefault()
        gesto.current.snapDisparado = true
        actualizarPosicion('arriba')
        return
      }

      if (posicionRef.current === 'arriba' && scrollTop === 0 && deltaY > 0) {
        // Gesto hacia abajo en el tope de la lista con panel en 15dvh → bajar panel
        gesto.current.snapDisparado = true
        actualizarPosicion('abajo')
        return
      }

      // Resto de casos: scroll normal de la lista (no interferir)
    }

    // passive: false solo en touchmove para poder llamar preventDefault cuando subimos el panel
    panel.addEventListener('touchstart', onTouchStart, { passive: true })
    panel.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      panel.removeEventListener('touchstart', onTouchStart)
      panel.removeEventListener('touchmove', onTouchMove)
    }
  }, []) // deps vacías: posicionRef mantiene el valor fresco sin re-registrar listeners

  return (
    <div
      ref={panelRef}
      className="fixed left-0 right-0 bottom-0 bg-zinc-900 overflow-y-auto"
      style={{
        top: posicion === 'abajo' ? POSICION_ABAJO : POSICION_ARRIBA,
        zIndex: 10,
        borderRadius: '24px 24px 0 0',
        transition: 'top 0.3s ease',
      }}
    >
      {/* Header sticky: permanece visible al hacer scroll en la lista */}
      <div className="sticky top-0 bg-zinc-900 px-5 pt-5 pb-3 z-10">
        <h2 className="text-white font-semibold text-base tracking-tight">Tareas</h2>
      </div>

      {tareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 py-14 px-8 text-center">
          <p className="text-zinc-400 text-sm">Agrega tu primera tarea</p>
          <p className="text-zinc-600 text-xs mt-1">
            Usa el botón <span className="text-violet-400 font-bold">+</span> de abajo
          </p>
        </div>
      ) : (
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
