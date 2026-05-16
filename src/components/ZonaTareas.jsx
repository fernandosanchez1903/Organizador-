import { useRef, useState, useEffect } from 'react'
import { calcularVida } from '../utils/tareas'
import TarjetaTarea from './TarjetaTarea'

// Dos posiciones de snap en CSS (top del panel fijo)
const POS_ABAJO = '55dvh'
const POS_ARRIBA = '15dvh'

// Flick: si la velocidad supera este umbral al soltar, se snap en esa dirección
const UMBRAL_VELOCIDAD = 0.3 // px/ms

// Panel con dos modos:
//   Drag: transform translateY sigue el dedo sin transición (GPU, sin re-renders)
//   Snap: top cambia con transition 0.3s; transform se quita primero vía reflow
//         para que la animación arranque desde la posición visual real
export default function ZonaTareas({ tareas, onCompletar, onEliminar, onEditar }) {
  // Estado React: determina el top base del panel en el JSX
  const [posicion, setPosicion] = useState('abajo')

  const panelRef = useRef(null)

  // Espejo de posicion para leer valor fresco dentro de los event listeners
  // sin necesidad de re-registrarlos en cada cambio de estado
  const posicionRef = useRef('abajo')

  // Estado mutable del gesto activo; no dispara re-renders
  const gesto = useRef({
    arrastrando: false,   // true cuando el gesto confirmó ser un drag del panel
    startY: 0,            // Y del touchstart
    liveTransformY: 0,    // translateY acumulado durante el drag (actualizado en cada frame)
    ultimaY: 0,
    velocidad: 0,         // px/ms, actualizada cada touchmove
    ultimoTiempo: 0,
  })

  // Actualiza ref y estado React en sincronía
  function actualizarPosicion(nueva) {
    posicionRef.current = nueva
    setPosicion(nueva)
  }

  // Escribe transform directamente en el DOM — evita pasar por React en cada frame
  function aplicarTransform(dy) {
    const panel = panelRef.current
    if (!panel) return
    panel.style.transform = `translateY(${dy}px)`
    gesto.current.liveTransformY = dy
  }

  // Distancia máxima de drag en píxeles (diferencia entre 55dvh y 15dvh)
  function getMaxDrag() {
    return window.innerHeight * 0.40
  }

  // Anima el snap al soltar:
  // 1. Fija top en la posición visual actual (top base + transform acumulado)
  // 2. Quita el transform → ningún cambio visual, pero ahora top = posición real
  // 3. Reflow forzado → el navegador registra el estado antes de la transición
  // 4. Activa transition y cambia top al valor de snap → animación limpia
  function hacerSnap(targetPosicion) {
    const panel = panelRef.current
    if (!panel) return

    const topBasePx = posicionRef.current === 'abajo'
      ? window.innerHeight * 0.55
      : window.innerHeight * 0.15
    const visualTopPx = topBasePx + gesto.current.liveTransformY

    panel.style.transition = 'none'
    panel.style.top = `${visualTopPx}px`
    panel.style.transform = 'translateY(0)'

    // Forzar reflow: el navegador procesa los dos cambios anteriores antes
    // de que apliquemos la transición; sin esto, la animación no tiene punto de inicio
    void panel.offsetHeight

    panel.style.transition = 'top 0.3s ease'
    panel.style.top = targetPosicion === 'abajo' ? POS_ABAJO : POS_ARRIBA

    gesto.current.arrastrando = false
    gesto.current.liveTransformY = 0
    actualizarPosicion(targetPosicion)
  }

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    // Resetea el estado del gesto y detiene cualquier transición en curso
    function onTouchStart(e) {
      const touch = e.touches[0]
      gesto.current.arrastrando = false
      gesto.current.startY = touch.clientY
      gesto.current.liveTransformY = 0
      gesto.current.ultimaY = touch.clientY
      gesto.current.velocidad = 0
      gesto.current.ultimoTiempo = Date.now()
      // Interrumpir transición CSS en curso para que el drag empiece desde aquí
      panel.style.transition = 'none'
    }

    // Resuelve en cada frame si el gesto pertenece al drag del panel o al scroll de la lista.
    // Panel abajo: cualquier dedo hacia arriba mueve el panel.
    // Panel arriba: solo mueve el panel si scrollTop === 0 y dedo va hacia abajo;
    //               en cualquier otro caso la lista scrollea normalmente.
    function onTouchMove(e) {
      const touch = e.touches[0]
      const ahora = Date.now()
      const deltaY = touch.clientY - gesto.current.startY
      const scrollTop = panel.scrollTop

      // Velocidad actualizada en cada frame para flick preciso al soltar
      const dt = ahora - gesto.current.ultimoTiempo
      if (dt > 0) {
        gesto.current.velocidad = (touch.clientY - gesto.current.ultimaY) / dt
      }
      gesto.current.ultimaY = touch.clientY
      gesto.current.ultimoTiempo = ahora

      if (posicionRef.current === 'abajo') {
        if (deltaY < 0) {
          // Gesto hacia arriba con panel abajo → drag del panel, bloquear scroll
          e.preventDefault()
          gesto.current.arrastrando = true
          aplicarTransform(Math.max(-getMaxDrag(), deltaY))
        }
        // Gesto hacia abajo con panel ya abajo → ignorar (sin más espacio)
        return
      }

      // Panel arriba:
      if (scrollTop > 0) {
        // Lista tiene scroll → el gesto pertenece a la lista
        return
      }

      if (deltaY > 0) {
        // Tope del scroll + dedo hacia abajo → drag del panel hacia abajo
        e.preventDefault()
        gesto.current.arrastrando = true
        aplicarTransform(Math.min(getMaxDrag(), deltaY))
        return
      }

      // scrollTop === 0 + dedo hacia arriba → scroll normal de la lista
    }

    // Determina la posición de snap por velocidad (flick) o distancia al punto medio (35dvh)
    function onTouchEnd() {
      if (!gesto.current.arrastrando) {
        // Gesto sin drag real: limpiar transform por si quedó algo residual
        panel.style.transform = 'translateY(0)'
        return
      }

      const velocidad = gesto.current.velocidad
      const topBasePx = posicionRef.current === 'abajo'
        ? window.innerHeight * 0.55
        : window.innerHeight * 0.15
      const visualTopPx = topBasePx + gesto.current.liveTransformY
      const mitadPx = window.innerHeight * 0.35 // 35dvh = punto medio entre 15dvh y 55dvh

      let target
      if (velocidad > UMBRAL_VELOCIDAD) {
        target = 'abajo'    // flick hacia abajo
      } else if (velocidad < -UMBRAL_VELOCIDAD) {
        target = 'arriba'   // flick hacia arriba
      } else {
        // Sin flick: snap al lado más cercano del punto medio
        target = visualTopPx > mitadPx ? 'abajo' : 'arriba'
      }

      hacerSnap(target)
    }

    // passive: true donde sea posible; false solo en touchmove donde se necesita preventDefault
    panel.addEventListener('touchstart', onTouchStart, { passive: true })
    panel.addEventListener('touchmove', onTouchMove, { passive: false })
    panel.addEventListener('touchend', onTouchEnd, { passive: true })
    // touchcancel ocurre cuando el OS interrumpe el gesto (llamada, notificación)
    panel.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      panel.removeEventListener('touchstart', onTouchStart)
      panel.removeEventListener('touchmove', onTouchMove)
      panel.removeEventListener('touchend', onTouchEnd)
      panel.removeEventListener('touchcancel', onTouchEnd)
    }
  }, []) // deps vacías: todo el estado mutable vive en refs

  return (
    <div
      ref={panelRef}
      className="fixed left-0 right-0 bottom-0 bg-zinc-900 overflow-y-auto"
      style={{
        top: posicion === 'abajo' ? POS_ABAJO : POS_ARRIBA,
        zIndex: 10,
        borderRadius: '24px 24px 0 0',
        willChange: 'transform, top',
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
