import { useState } from 'react'

// Muestra un banner rojo oscuro con las tareas que llegaron a 0% de vida.
// Solo desaparece si el usuario lo cierra manualmente (estado local, no persiste entre recargas).
export default function BannerUrgente({ tareas, calcularVida }) {
  const [visible, setVisible] = useState(true)

  // Filtra las tareas cuya vida llegó exactamente a 0%.
  const urgentes = tareas.filter((t) => calcularVida(t.ultimaVez, t.frecuenciaDias) === 0)

  if (!visible || urgentes.length === 0) return null

  return (
    <div className="max-w-3xl mx-auto mb-6 bg-red-950 border border-red-700 rounded-2xl px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-red-300 font-semibold text-sm">
          {urgentes.length === 1
            ? '¡1 tarea ha muerto!'
            : `¡${urgentes.length} tareas han muerto!`}
        </p>
        {/* Cierra el banner hasta la próxima recarga */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Cerrar aviso"
          className="text-red-500 hover:text-red-300 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Lista de tareas urgentes con su emoji */}
      <ul className="flex flex-col gap-1">
        {urgentes.map((t) => (
          <li key={t.id} className="text-red-400 text-xs">
            {t.emoji} {t.nombre}
          </li>
        ))}
      </ul>
    </div>
  )
}
