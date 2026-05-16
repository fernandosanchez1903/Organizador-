import { useRef, useEffect } from 'react'
import { calcularVida } from '../utils/tareas'
import TarjetaTarea from './TarjetaTarea'

// Ancla superior: si el panel llega aquí o más arriba, se fija y el scroll toma control
const ANCLA_ARRIBA = '15dvh'

// El panel puede estar en dos modos:
//   'arriba' — anclado en 15dvh; el scroll de la lista tiene prioridad
//   'libre'  — en cualquier otra posición; el drag del panel tiene prioridad
//
// top se gestiona 100% por DOM imperativo (sin React state) para que
// re-renders de la lista no reseteen la posición del panel
export default function ZonaTareas({ tareas, onCompletar, onEliminar, onEditar }) {
  const panelRef = useRef(null)

  // Modo actual del panel; leído dentro de los event listeners sin stale closures
  const posicionRef = useRef('libre')

  // Estado mutable del gesto; no dispara re-renders
  const gesto = useRef({
    arrastrando: false,
    startY: 0,         // Y del touchstart, referencia para calcular deltaTotal
    topBase: 0,        // top del panel en px al inicio del gesto (leído del DOM)
    liveTransformY: 0, // translateY aplicado en el último frame
  })

  // Escribe transform directamente en el DOM para evitar re-renders en el hot path
  function aplicarTransform(dy) {
    const panel = panelRef.current
    if (!panel) return
    panel.style.transform = `translateY(${dy}px)`
    gesto.current.liveTransformY = dy
  }

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    // Posición inicial: 55dvh (panel visible en la parte inferior de la pantalla)
    panel.style.top = '55dvh'

    // Lee el top computado actual del panel en píxeles.
    // getComputedStyle resuelve dvh/rem a px, incluso durante animaciones.
    function leerTopActualPx() {
      return parseFloat(getComputedStyle(panel).top)
    }

    // Captura la posición visual del panel al inicio del gesto y detiene
    // cualquier transición en curso para que el drag empiece desde ahí.
    function onTouchStart(e) {
      panel.style.transition = 'none'
      panel.style.overflowY = 'visible'
      gesto.current.arrastrando = false
      gesto.current.startY = e.touches[0].clientY
      gesto.current.topBase = leerTopActualPx()
      gesto.current.liveTransformY = 0
    }

    // Decide en cada frame a quién pertenece el gesto: al panel o a la lista.
    //
    // Modo 'arriba' (anclado en 15dvh):
    //   - scrollTop > 0 → la lista scrollea, no tocar el panel
    //   - deltaTotal <= 0 (dedo arriba o quieto) → la lista scrollea
    //   - deltaTotal > 0 + scrollTop === 0 → drag del panel hacia abajo
    //
    // Modo 'libre':
    //   - deltaTotal < 0 (dedo arriba) → drag del panel hacia arriba, clampear en 15dvh
    //   - deltaTotal > 0 + scrollTop === 0 → drag del panel hacia abajo
    //   - deltaTotal > 0 + scrollTop > 0 → la lista scrollea
    function onTouchMove(e) {
      const touch = e.touches[0]
      // deltaTotal: desplazamiento acumulado desde el touchstart, no incremental por frame.
      // Así el clamp y las condiciones son directas sin necesidad de acumular estado.
      const deltaTotal = touch.clientY - gesto.current.startY
      const scrollTop = panel.scrollTop
      const anclaArribaPx = window.innerHeight * 0.15

      if (posicionRef.current === 'arriba') {
        if (scrollTop > 0) return      // lista con scroll: gesto es suyo
        if (deltaTotal <= 0) return    // dedo arriba en el tope: scroll normal
        // Dedo hacia abajo en el tope → soltar el ancla, mover panel abajo
        e.preventDefault()
        gesto.current.arrastrando = true
        aplicarTransform(Math.min(window.innerHeight * 0.80 - gesto.current.topBase, deltaTotal))
        return
      }

      // Modo 'libre':
      if (deltaTotal < 0) {
        // Dedo hacia arriba → mover panel hacia arriba, sin pasar el ancla
        const topProyectado = gesto.current.topBase + deltaTotal
        const dy = topProyectado <= anclaArribaPx
          ? anclaArribaPx - gesto.current.topBase  // clamp: parar en 15dvh
          : deltaTotal
        e.preventDefault()
        gesto.current.arrastrando = true
        aplicarTransform(dy)
        return
      }

      if (deltaTotal > 0 && scrollTop === 0) {
        // Dedo hacia abajo en el tope → mover panel abajo
        e.preventDefault()
        gesto.current.arrastrando = true
        aplicarTransform(Math.min(window.innerHeight * 0.80 - gesto.current.topBase, deltaTotal))
      }
      // deltaTotal > 0 + scrollTop > 0 → lista scrollea, no interferir
    }

    // Al soltar: fijar top en la posición visual actual sin animación.
    // Si el panel llegó al ancla (15dvh), fijar en ANCLA_ARRIBA y cambiar modo.
    function onTouchEnd() {
      panel.style.transform = 'translateY(0)'
      panel.style.overflowY = 'auto'

      if (!gesto.current.arrastrando) return

      const anclaArribaPx = window.innerHeight * 0.15
      const visualTopPx = gesto.current.topBase + gesto.current.liveTransformY

      panel.style.transition = 'none'

      if (visualTopPx <= anclaArribaPx) {
        panel.style.top = ANCLA_ARRIBA
        posicionRef.current = 'arriba'
      } else {
        panel.style.top = `${visualTopPx}px`
        posicionRef.current = 'libre'
      }

      gesto.current.arrastrando = false
      gesto.current.liveTransformY = 0
    }

    // passive: true donde sea posible; false en touchmove para poder llamar preventDefault
    panel.addEventListener('touchstart', onTouchStart, { passive: true })
    panel.addEventListener('touchmove', onTouchMove, { passive: false })
    panel.addEventListener('touchend', onTouchEnd, { passive: true })
    // touchcancel cubre interrupciones del OS (llamada entrante, notificación del sistema)
    panel.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      panel.removeEventListener('touchstart', onTouchStart)
      panel.removeEventListener('touchmove', onTouchMove)
      panel.removeEventListener('touchend', onTouchEnd)
      panel.removeEventListener('touchcancel', onTouchEnd)
    }
  }, []) // deps vacías: todo el estado mutable vive en refs

  return (
    // top NO está en el style de React — gestionado imperativamnete en el useEffect
    // para que re-renders (al completar/agregar tareas) no reseteen la posición del panel
    <div
      ref={panelRef}
      className="fixed left-0 right-0 bottom-0 bg-zinc-900 overflow-y-auto"
      style={{
        zIndex: 10,
        borderRadius: '24px 24px 0 0',
        willChange: 'transform, top',
        minHeight: '100%',
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
