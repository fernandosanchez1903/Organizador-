import { useState, useRef, useEffect } from 'react'
import { colorBarra } from '../utils/tareas'

function IconoBasura() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function IconoLapiz() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

// Tarjeta compacta de una sola fila: [emoji] [nombre] [barra vida]
// Tap = completar con flash verde.
// Swipe izquierda = confirmar eliminar (fondo rojo, ícono basura derecha).
// Swipe derecha = editar directo (fondo verde, ícono lápiz izquierda).
export default function TarjetaTarea({ nombre, emoji, vida, onCompletar, onEliminar, onEditar }) {
  const [completando, setCompletando] = useState(false)
  const contenedorRef = useRef(null) // li — recibe touch events y define offsetWidth para el umbral
  const tarjetaRef = useRef(null)    // cara de la tarjeta — recibe translateX
  const bgLeftRef = useRef(null)     // fondo rojo revelado al deslizar a la izquierda
  const bgRightRef = useRef(null)    // fondo verde revelado al deslizar a la derecha

  // Refs para callbacks — evitan stale closures sin re-registrar listeners
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
    const contenedor = contenedorRef.current
    const tarjeta = tarjetaRef.current
    const bgLeft = bgLeftRef.current
    const bgRight = bgRightRef.current
    if (!contenedor || !tarjeta || !bgLeft || !bgRight) return

    function ocultarFondos() {
      bgLeft.style.display = 'none'
      bgRight.style.display = 'none'
    }

    function aplicarTranslate(dx) {
      tarjeta.style.transform = `translateX(${dx}px)`
      swipe.current.deltaX = dx
      // Mostrar el fondo correspondiente a la dirección del swipe
      if (dx < 0) {
        bgLeft.style.display = 'flex'
        bgRight.style.display = 'none'
      } else if (dx > 0) {
        bgRight.style.display = 'flex'
        bgLeft.style.display = 'none'
      } else {
        ocultarFondos()
      }
    }

    // Regresa la tarjeta a su posición y oculta los fondos al terminar la transición
    function snapDeVuelta() {
      tarjeta.style.transition = 'transform 0.25s ease'
      tarjeta.style.transform = 'translateX(0)'
      setTimeout(() => {
        tarjeta.style.transition = ''
        ocultarFondos()
      }, 250)
    }

    function onTouchStart(e) {
      swipe.current.activo = true
      swipe.current.startX = e.touches[0].clientX
      swipe.current.startY = e.touches[0].clientY
      swipe.current.deltaX = 0
      swipe.current.esDrag = false
      tarjeta.style.transition = 'none'
      ocultarFondos()
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

      const umbral = contenedor.offsetWidth * 0.40
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

    contenedor.addEventListener('touchstart', onTouchStart, { passive: true })
    contenedor.addEventListener('touchmove', onTouchMove, { passive: false })
    contenedor.addEventListener('touchend', onTouchEnd, { passive: true })
    contenedor.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      contenedor.removeEventListener('touchstart', onTouchStart)
      contenedor.removeEventListener('touchmove', onTouchMove)
      contenedor.removeEventListener('touchend', onTouchEnd)
      contenedor.removeEventListener('touchcancel', onTouchEnd)
    }
  }, []) // deps vacías: callbacks y nombre viven en cbRef

  return (
    <li
      ref={contenedorRef}
      onClick={handleCompletar}
      className="relative overflow-hidden rounded-2xl cursor-pointer select-none"
    >
      {/* Fondo rojo — revelado al deslizar a la izquierda; ícono basura en el lado derecho */}
      <div
        ref={bgLeftRef}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#ef4444',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '20px',
        }}
      >
        <IconoBasura />
      </div>

      {/* Fondo verde — revelado al deslizar a la derecha; ícono lápiz en el lado izquierdo */}
      <div
        ref={bgRightRef}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#22c55e',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: '20px',
        }}
      >
        <IconoLapiz />
      </div>

      {/* Cara de la tarjeta — se mueve encima de los fondos vía translateX */}
      <div
        ref={tarjetaRef}
        className={`relative flex items-center gap-3 px-4 py-4 rounded-2xl border
          ${completando
            ? 'bg-green-950 border-green-800'
            : 'bg-zinc-800 border-zinc-700'
          }`}
      >
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
