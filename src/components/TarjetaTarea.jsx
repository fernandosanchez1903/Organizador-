import { useState, useRef, useEffect } from 'react'
import { colorBarra } from '../utils/tareas'

// Tarjeta compacta de una sola fila: [emoji] [nombre] [barra vida]
// Tap = completar con flash verde.
// Swipe izquierda = confirmar eliminar (hint rojo). Swipe derecha = editar (hint verde).
export default function TarjetaTarea({ nombre, emoji, vida, onCompletar, onEliminar, onEditar }) {
  const [completando, setCompletando] = useState(false)
  const tarjetaRef = useRef(null)
  const bgRef = useRef(null)

  // Refs para callbacks y nombre — evitan stale closures sin re-registrar listeners
  const cbRef = useRef({ nombre, onEliminar, onEditar })
  useEffect(() => {
    cbRef.current = { nombre, onEliminar, onEditar }
  })

  // Estado mutable del gesto — no dispara re-renders
  const swipe = useRef({
    activo: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    esDrag: false,
  })

  // Activa el flash verde, espera 600ms, y llama onCompletar.
  // Bloqueado durante el drag para no dispararse al soltar un swipe.
  function handleCompletar() {
    if (completando || swipe.current.esDrag) return
    setCompletando(true)
    setTimeout(() => {
      setCompletando(false)
      onCompletar()
    }, 600)
  }

  useEffect(() => {
    const el = tarjetaRef.current
    const bgEl = bgRef.current
    if (!el || !bgEl) return

    function aplicarTranslate(dx) {
      el.style.transform = `translateX(${dx}px)`
      swipe.current.deltaX = dx
      // Opacidad proporcional al desplazamiento; máximo al llegar al umbral
      const umbral = el.offsetWidth * 0.40
      const progreso = Math.min(Math.abs(dx) / umbral, 1)
      bgEl.style.opacity = (progreso * 0.55).toString()
      bgEl.style.backgroundColor = dx < 0 ? '#ef4444' : '#22c55e'
    }

    // Regresa la tarjeta y desvanece el color con transición suave
    function snapDeVuelta() {
      el.style.transition = 'transform 0.25s ease'
      el.style.transform = 'translateX(0)'
      bgEl.style.transition = 'opacity 0.25s ease'
      bgEl.style.opacity = '0'
      setTimeout(() => {
        el.style.transition = ''
        bgEl.style.transition = ''
      }, 250)
    }

    function onTouchStart(e) {
      swipe.current.activo = true
      swipe.current.startX = e.touches[0].clientX
      swipe.current.startY = e.touches[0].clientY
      swipe.current.deltaX = 0
      swipe.current.esDrag = false
      el.style.transition = 'none'
      bgEl.style.transition = 'none'
      bgEl.style.opacity = '0'
    }

    function onTouchMove(e) {
      if (!swipe.current.activo) return
      const dx = e.touches[0].clientX - swipe.current.startX
      const dy = e.touches[0].clientY - swipe.current.startY

      // Si el movimiento vertical supera al horizontal, ceder el gesto al scroll del panel
      if (!swipe.current.esDrag && Math.abs(dy) > Math.abs(dx)) {
        swipe.current.activo = false
        return
      }

      if (Math.abs(dx) > 5) {
        swipe.current.esDrag = true
        // preventDefault suprime el click posterior, evitando que se dispare handleCompletar
        e.preventDefault()
        aplicarTranslate(dx)
      }
    }

    function onTouchEnd() {
      if (!swipe.current.activo) {
        swipe.current.esDrag = false
        return
      }
      swipe.current.activo = false

      const umbral = el.offsetWidth * 0.40
      const dx = swipe.current.deltaX

      snapDeVuelta()

      if (dx < -umbral) {
        // Swipe izquierda: confirmar y eliminar
        if (window.confirm(`¿Eliminar "${cbRef.current.nombre}"?`)) cbRef.current.onEliminar()
      } else if (dx > umbral) {
        // Swipe derecha: editar directo
        cbRef.current.onEditar()
      }

      // Limpiar esDrag después de que el click potencial haya sido procesado
      setTimeout(() => { swipe.current.esDrag = false }, 0)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, []) // deps vacías: callbacks y nombre viven en cbRef

  return (
    <li
      ref={tarjetaRef}
      onClick={handleCompletar}
      className={`relative overflow-hidden rounded-2xl border cursor-pointer select-none
        ${completando
          ? 'bg-green-950 border-green-800'
          : 'bg-zinc-800 border-zinc-700 active:scale-[0.98]'
        }`}
    >
      {/* Hint de color detrás del contenido — opacidad gestionada imperativamnte durante el swipe */}
      <div
        ref={bgRef}
        style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', zIndex: 0 }}
      />

      {/* Contenido sobre el hint */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-4 w-full">
        <span className="text-[32px] leading-none shrink-0">{emoji}</span>
        <span className="flex-1 text-white text-base font-medium truncate">{nombre}</span>
        <div className="w-20 shrink-0 flex flex-col gap-1">
          <div className="w-full bg-zinc-700 rounded-full h-[6px] overflow-hidden">
            <div
              className={`h-[6px] rounded-full transition-all duration-500 ${colorBarra(vida)}`}
              style={{ width: `${vida}%` }}
            />
          </div>
          <span className="text-zinc-500 text-[10px] text-right tabular-nums">{vida}%</span>
        </div>
      </div>
    </li>
  )
}
