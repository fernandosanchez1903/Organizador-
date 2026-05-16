import { useRef, useEffect } from 'react'
import { calcularVida } from '../utils/tareas'
import TarjetaTarea from './TarjetaTarea'

// Desplazamiento entre posición colapsada (55dvh) y expandida (15dvh): 40% del viewport.
const FRACCION_DESPLAZAMIENTO = 0.40
// Umbral de velocidad en px/ms para detectar un flick rápido.
const UMBRAL_VELOCIDAD = 0.5

// Panel draggable con dos posiciones de snap:
//   - Abajo:  top 55dvh + translateY(0)      → posición inicial
//   - Arriba: top 55dvh + translateY(-40dvh) → posición expandida (equivale a 15dvh)
// Todo el estado de drag vive en refs para evitar re-renders durante el gesto.
export default function ZonaTareas({ tareas, onCompletar, onEliminar, onEditar }) {
  const panelRef = useRef(null)

  // Última posición snapped en px (0 = abajo, negativo = expandido).
  const snapRef = useRef(0)

  // Estado mutable del gesto activo; no dispara re-renders.
  const gesto = useRef({
    activo: false,      // true desde que se supera el threshold hasta touchend
    dragStartY: null,   // calibrado cuando scrollTop llega a 0 por primera vez
    liveOffset: 0,      // offset del panel durante el drag (actualizado cada frame)
    ultimaY: 0,
    velocidad: 0,       // px/ms, actualizada cada touchmove para flick preciso
    ultimoTiempo: 0,
  })

  // Escribe el transform directamente en el DOM para evitar pasar por React en cada frame.
  // conTransicion: false durante el drag, true solo al hacer snap.
  function aplicarTransform(offset, conTransicion) {
    const panel = panelRef.current
    if (!panel) return
    panel.style.transition = conTransicion
      ? 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
      : 'none'
    panel.style.transform = `translateY(${offset}px)`
  }

  // Distancia máxima que puede subir el panel (40% del viewport actual).
  // Se llama en runtime para respetar cambios de alto (ej. teclado virtual de iOS).
  function getMaxOffset() {
    return window.innerHeight * FRACCION_DESPLAZAMIENTO
  }

  // Confirma una posición de snap: guarda el valor en ref y anima con transición.
  function hacerSnap(targetOffset) {
    snapRef.current = targetOffset
    gesto.current.liveOffset = targetOffset
    gesto.current.activo = false
    aplicarTransform(targetOffset, true)
  }

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    // Registra la posición Y inicial y resetea todo el estado del gesto.
    function onTouchStart(e) {
      const touch = e.touches[0]
      gesto.current.activo = false
      gesto.current.dragStartY = null
      gesto.current.liveOffset = snapRef.current
      gesto.current.ultimaY = touch.clientY
      gesto.current.velocidad = 0
      gesto.current.ultimoTiempo = Date.now()
    }

    // Resuelve el conflicto scroll vs drag en cada frame:
    // - scrollTop > 0 → el gesto pertenece al scroll de la lista, no tocar el panel
    // - scrollTop === 0 → tomar control del gesto como drag del panel
    function onTouchMove(e) {
      const touch = e.touches[0]
      const scrollTop = panel.scrollTop
      const ahora = Date.now()

      // Actualizar velocidad siempre (incluso sin drag activo) para flick preciso al soltar
      const dt = ahora - gesto.current.ultimoTiempo
      if (dt > 0) {
        gesto.current.velocidad = (touch.clientY - gesto.current.ultimaY) / dt
      }
      gesto.current.ultimaY = touch.clientY
      gesto.current.ultimoTiempo = ahora

      // Lista scrolleada: el gesto es de la lista, resetear punto de referencia de drag
      if (scrollTop > 0) {
        gesto.current.dragStartY = null
        gesto.current.activo = false
        return
      }

      // scrollTop === 0: establecer punto de referencia la primera vez que llegamos aquí.
      // Esto evita que el recorrido acumulado durante el scroll se interprete como drag.
      if (gesto.current.dragStartY === null) {
        gesto.current.dragStartY = touch.clientY
        return
      }

      const dragDelta = touch.clientY - gesto.current.dragStartY

      // Threshold de 5px antes de confirmar intención de drag (filtra micro-movimientos)
      if (!gesto.current.activo && Math.abs(dragDelta) < 5) return

      gesto.current.activo = true
      // Prevenir el scroll del documento ahora que confirmamos que es un drag del panel
      e.preventDefault()

      const maxOffset = getMaxOffset()
      // dragDelta > 0 (dedo baja) → panel baja → offset sube hacia 0
      // dragDelta < 0 (dedo sube) → panel sube → offset baja (más negativo)
      const rawOffset = snapRef.current + dragDelta
      const clampedOffset = Math.min(0, Math.max(-maxOffset, rawOffset))

      gesto.current.liveOffset = clampedOffset
      aplicarTransform(clampedOffset, false)
    }

    // Determina el snap target al soltar: flick rápido o posición relativa al punto medio.
    function onTouchEnd() {
      if (!gesto.current.activo) return

      const maxOffset = getMaxOffset()
      const velocidad = gesto.current.velocidad
      const offsetActual = gesto.current.liveOffset

      let target
      if (velocidad > UMBRAL_VELOCIDAD) {
        // Flick hacia abajo → colapsar al 55dvh
        target = 0
      } else if (velocidad < -UMBRAL_VELOCIDAD) {
        // Flick hacia arriba → expandir al 15dvh
        target = -maxOffset
      } else {
        // Sin flick: snap al punto más cercano respecto al punto medio
        const mitad = -maxOffset / 2
        target = offsetActual < mitad ? -maxOffset : 0
      }

      hacerSnap(target)
    }

    // passive: true donde sea posible; false solo en touchmove donde llamamos preventDefault
    panel.addEventListener('touchstart', onTouchStart, { passive: true })
    panel.addEventListener('touchmove', onTouchMove, { passive: false })
    panel.addEventListener('touchend', onTouchEnd, { passive: true })
    // touchcancel puede ocurrir si interrumpen el gesto (llamada entrante, etc.)
    panel.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      panel.removeEventListener('touchstart', onTouchStart)
      panel.removeEventListener('touchmove', onTouchMove)
      panel.removeEventListener('touchend', onTouchEnd)
      panel.removeEventListener('touchcancel', onTouchEnd)
    }
  }, []) // deps vacías: todo el estado mutable vive en refs, no necesita re-registrarse

  return (
    <div
      ref={panelRef}
      className="fixed left-0 right-0 bottom-0 bg-zinc-900 overflow-y-auto"
      style={{
        top: '55dvh',
        zIndex: 10,
        borderRadius: '24px 24px 0 0',
        transform: 'translateY(0px)',
        willChange: 'transform',
      }}
    >
      {/* Pill indicador de drag: affordance visual del bottom sheet */}
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-10 rounded-full bg-zinc-700" style={{ height: '4px' }} />
      </div>

      {/* Header sticky: se queda fijo en el tope de ZonaTareas al hacer scroll */}
      <div className="sticky top-0 bg-zinc-900 px-5 pt-3 pb-3 z-10">
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
        // pb-28 para que la última tarjeta no quede tapada por el FAB
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
