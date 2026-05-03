import { useState } from 'react'
import './App.css'

const CLAVE_STORAGE = 'organizador-tareas'

function haceDias(n) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - n)
  return fecha.toISOString()
}

const tareasIniciales = [
  { id: 1, nombre: 'Lavar ropa',    emoji: '🧺', frecuenciaDias: 3,  ultimaVez: haceDias(2) },
  { id: 2, nombre: 'Limpiar depa',  emoji: '🧹', frecuenciaDias: 7,  ultimaVez: haceDias(2) },
  { id: 3, nombre: 'Pagar tarjeta', emoji: '💳', frecuenciaDias: 30, ultimaVez: haceDias(2) },
]

function cargarTareas() {
  try {
    const guardadas = localStorage.getItem(CLAVE_STORAGE)
    if (guardadas) return JSON.parse(guardadas)
  } catch {}
  return tareasIniciales
}

function guardarTareas(tareas) {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(tareas))
}

function calcularVida(ultimaVez, frecuenciaDias) {
  const diasTranscurridos = (Date.now() - new Date(ultimaVez).getTime()) / 86_400_000
  return Math.max(0, Math.round(100 - (diasTranscurridos / frecuenciaDias) * 100))
}

function diasDesde(ultimaVez) {
  return Math.floor((Date.now() - new Date(ultimaVez).getTime()) / 86_400_000)
}

function colorBarra(vida) {
  if (vida > 60) return 'bg-green-500'
  if (vida >= 30) return 'bg-yellow-400'
  return 'bg-red-500'
}

/** Detecta si el string contiene al menos un emoji real */
function esEmoji(str) {
  return /\p{Extended_Pictographic}/u.test(str)
}

function IconoBasura() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function IconoLapiz() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TarjetaTarea({ nombre, emoji, vida, frecuenciaDias, ultimaVez, onCompletar, onEliminar, onEditar }) {
  const dias = diasDesde(ultimaVez)

  function handleEliminar(e) {
    e.stopPropagation()
    if (window.confirm(`¿Eliminar "${nombre}"?`)) onEliminar()
  }

  function handleEditar(e) {
    e.stopPropagation()
    onEditar()
  }

  return (
    <div className="relative bg-zinc-800 rounded-2xl p-6 flex flex-col gap-4 border border-zinc-700 transition-colors hover:border-zinc-600">
      <button
        onClick={handleEditar}
        aria-label={`Editar ${nombre}`}
        className="absolute top-3 left-3 p-1.5 text-zinc-600 hover:text-violet-400 hover:bg-zinc-700 rounded-lg transition-colors"
      >
        <IconoLapiz />
      </button>
      <button
        onClick={handleEliminar}
        aria-label={`Eliminar ${nombre}`}
        className="absolute top-3 right-3 p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
      >
        <IconoBasura />
      </button>

      <div className="text-5xl text-center">{emoji}</div>
      <p className="text-white font-semibold text-center text-lg leading-tight">{nombre}</p>
      <p className="text-zinc-500 text-xs text-center">
        Cada {frecuenciaDias} días · completado {dias === 0 ? 'hoy' : `hace ${dias}d`}
      </p>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Vida</span>
          <span>{vida}%</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${colorBarra(vida)}`}
            style={{ width: `${vida}%` }}
          />
        </div>
      </div>

      <button
        onClick={onCompletar}
        className="w-full mt-1 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 active:scale-95 text-zinc-300 hover:text-white text-sm font-medium transition-all"
      >
        ✓ Hecho
      </button>
    </div>
  )
}

const formVacio = { nombre: '', emoji: '', frecuenciaDias: '' }

function ModalTarea({ tareaInicial = null, onGuardar, onCerrar }) {
  const [form, setForm] = useState(
    tareaInicial
      ? { nombre: tareaInicial.nombre, emoji: tareaInicial.emoji, frecuenciaDias: String(tareaInicial.frecuenciaDias) }
      : formVacio
  )
  const [errorEmoji, setErrorEmoji] = useState('')

  function handleChange(campo) {
    return (e) => {
      setForm((prev) => ({ ...prev, [campo]: e.target.value }))
      if (campo === 'emoji') setErrorEmoji('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const emojiTrimmed = form.emoji.trim()

    if (emojiTrimmed && !esEmoji(emojiTrimmed)) {
      setErrorEmoji('Por favor ingresa un emoji válido')
      return
    }

    onGuardar({
      nombre: form.nombre.trim(),
      emoji: emojiTrimmed || '📝',
      frecuenciaDias: Number(form.frecuenciaDias),
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onCerrar}
    >
      <div
        className="bg-zinc-800 rounded-2xl p-6 w-full max-w-sm border border-zinc-700 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white font-semibold text-lg">{tareaInicial ? 'Editar tarea' : 'Nueva tarea'}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-xs">Nombre</span>
            <input
              type="text"
              value={form.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej. Lavar ropa"
              required
              autoFocus
              className="bg-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-500"
            />
          </label>

          <div className="flex flex-col gap-1">
            <label className="flex flex-col gap-1">
              <span className="text-zinc-400 text-xs">
                Emoji <span className="text-zinc-600">(opcional, default 📝)</span>
              </span>
              <input
                type="text"
                value={form.emoji}
                onChange={handleChange('emoji')}
                placeholder="🧺"
                className={`bg-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 placeholder:text-zinc-500 ${
                  errorEmoji ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-violet-500'
                }`}
              />
            </label>
            {errorEmoji && <p className="text-red-400 text-xs">{errorEmoji}</p>}
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-xs">Frecuencia (días)</span>
            <input
              type="number"
              value={form.frecuenciaDias}
              onChange={handleChange('frecuenciaDias')}
              placeholder="7"
              min="1"
              required
              className="bg-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-500"
            />
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-sm hover:bg-zinc-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [tareas, setTareas] = useState(cargarTareas)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tareaEditando, setTareaEditando] = useState(null)

  function completarTarea(id) {
    const nuevasTareas = tareas.map((t) =>
      t.id === id ? { ...t, ultimaVez: new Date().toISOString() } : t
    )
    setTareas(nuevasTareas)
    guardarTareas(nuevasTareas)
  }

  function eliminarTarea(id) {
    const nuevasTareas = tareas.filter((t) => t.id !== id)
    setTareas(nuevasTareas)
    guardarTareas(nuevasTareas)
  }

  function editarTarea({ nombre, emoji, frecuenciaDias }) {
    const nuevasTareas = tareas.map((t) =>
      t.id === tareaEditando.id ? { ...t, nombre, emoji, frecuenciaDias } : t
    )
    setTareas(nuevasTareas)
    guardarTareas(nuevasTareas)
    setTareaEditando(null)
  }

  function agregarTarea({ nombre, emoji, frecuenciaDias }) {
    const nuevaTarea = {
      id: Date.now(),
      nombre,
      emoji,
      frecuenciaDias,
      ultimaVez: new Date().toISOString(),
    }
    const nuevasTareas = [...tareas, nuevaTarea]
    setTareas(nuevasTareas)
    guardarTareas(nuevasTareas)
    setModalAbierto(false)
  }

  return (
    <div className="min-h-screen bg-zinc-900 px-6 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Organizador</h1>
        <p className="text-zinc-400 mt-1 text-sm">Tus tareas tienen vida. No las dejes morir.</p>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto pb-24">
        {tareas.map((tarea) => (
          <TarjetaTarea
            key={tarea.id}
            nombre={tarea.nombre}
            emoji={tarea.emoji}
            vida={calcularVida(tarea.ultimaVez, tarea.frecuenciaDias)}
            frecuenciaDias={tarea.frecuenciaDias}
            ultimaVez={tarea.ultimaVez}
            onCompletar={() => completarTarea(tarea.id)}
            onEliminar={() => eliminarTarea(tarea.id)}
            onEditar={() => setTareaEditando(tarea)}
          />
        ))}
      </main>

      <button
        onClick={() => setModalAbierto(true)}
        aria-label="Agregar tarea"
        className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-3xl rounded-full shadow-lg shadow-violet-900/50 transition-all flex items-center justify-center"
      >
        +
      </button>

      {modalAbierto && (
        <ModalTarea
          onGuardar={agregarTarea}
          onCerrar={() => setModalAbierto(false)}
        />
      )}

      {tareaEditando && (
        <ModalTarea
          tareaInicial={tareaEditando}
          onGuardar={editarTarea}
          onCerrar={() => setTareaEditando(null)}
        />
      )}
    </div>
  )
}
