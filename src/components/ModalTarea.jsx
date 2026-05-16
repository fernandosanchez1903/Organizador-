import { useState } from 'react'
import { esEmoji } from '../utils/tareas'

// Definido fuera del componente para que no se recree en cada render.
const formVacio = { nombre: '', emoji: '', frecuenciaDias: '' }

// Modal dual: crea una tarea nueva (tareaInicial = null) o edita una existente.
// Lógica intacta respecto a v1; solo el aspecto visual fue actualizado.
export default function ModalTarea({ tareaInicial = null, onGuardar, onCerrar }) {
  const [form, setForm] = useState(
    tareaInicial
      ? { nombre: tareaInicial.nombre, emoji: tareaInicial.emoji, frecuenciaDias: String(tareaInicial.frecuenciaDias) }
      : formVacio
  )
  const [errorEmoji, setErrorEmoji] = useState('')

  // Devuelve un handler de onChange para el campo indicado (currying).
  function handleChange(campo) {
    return (e) => {
      setForm((prev) => ({ ...prev, [campo]: e.target.value }))
      if (campo === 'emoji') setErrorEmoji('')
    }
  }

  // Valida el emoji antes de guardar; usa 📝 como default si el campo está vacío.
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
    // Overlay: semitransparente con blur sutil para enfocar el modal
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-4"
      onClick={onCerrar}
      style={{ zIndex: 60 }}
    >
      {/* Panel del modal: mismo lenguaje visual que ZonaTareas */}
      <div
        className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white font-semibold text-base">
          {tareaInicial ? 'Editar tarea' : 'Nueva tarea'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-zinc-500 text-xs uppercase tracking-wide">Nombre</span>
            <input
              type="text"
              value={form.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej. Lavar ropa"
              required
              autoFocus
              className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 placeholder:text-zinc-600 transition-colors"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-zinc-500 text-xs uppercase tracking-wide">
                Emoji <span className="text-zinc-700 normal-case">(opcional, default 📝)</span>
              </span>
              <input
                type="text"
                value={form.emoji}
                onChange={handleChange('emoji')}
                placeholder="🧺"
                className={`bg-zinc-800 border text-white rounded-xl px-3 py-2.5 text-base outline-none focus:ring-2 placeholder:text-zinc-600 transition-colors ${
                  errorEmoji
                    ? 'border-red-600 ring-2 ring-red-600 focus:ring-red-500'
                    : 'border-zinc-700 focus:ring-violet-500 focus:border-violet-500'
                }`}
              />
            </label>
            {errorEmoji && <p className="text-red-400 text-xs">{errorEmoji}</p>}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-zinc-500 text-xs uppercase tracking-wide">Frecuencia (días)</span>
            <input
              type="number"
              value={form.frecuenciaDias}
              onChange={handleChange('frecuenciaDias')}
              placeholder="7"
              min="1"
              required
              className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 placeholder:text-zinc-600 transition-colors"
            />
          </label>

          <div className="flex gap-3 pt-1">
            {/* Botón cancelar: ghost con borde */}
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-700 hover:text-zinc-300 transition-colors"
            >
              Cancelar
            </button>
            {/* Botón confirmar: acento violeta */}
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 active:scale-[0.98] transition-all"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
