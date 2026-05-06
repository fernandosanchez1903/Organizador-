import { useState } from 'react'
import { esEmoji } from '../utils/tareas'

// Definido fuera del componente para que no se recree en cada render;
// se usa como valor inicial del form solo cuando se crea una tarea nueva.
const formVacio = { nombre: '', emoji: '', frecuenciaDias: '' }

// Modal dual: crea una tarea nueva (tareaInicial = null) o edita una existente
// (tareaInicial = objeto tarea). El título y el estado inicial del form cambian según el modo.
export default function ModalTarea({ tareaInicial = null, onGuardar, onCerrar }) {
  const [form, setForm] = useState(
    tareaInicial
      ? { nombre: tareaInicial.nombre, emoji: tareaInicial.emoji, frecuenciaDias: String(tareaInicial.frecuenciaDias) }
      : formVacio
  )
  const [errorEmoji, setErrorEmoji] = useState('')

  // Devuelve un handler de onChange para el campo indicado (currying).
  // Evita definir una función separada por cada input y limpia el error de emoji al escribir.
  function handleChange(campo) {
    return (e) => {
      setForm((prev) => ({ ...prev, [campo]: e.target.value }))
      if (campo === 'emoji') setErrorEmoji('')
    }
  }

  // Valida el emoji antes de llamar a onGuardar: si el campo no está vacío pero
  // no contiene un emoji real, muestra el error y aborta. Si está vacío, usa 📝 por defecto.
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
