import { useState } from 'react'

// Clave única para identificar los datos en localStorage
const CLAVE_STORAGE = 'organizador-tareas'

// Genera una fecha ISO de hace N días (usado para datos seed)
function haceDias(n) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - n)
  return fecha.toISOString()
}

// Tareas de ejemplo que se cargan solo si localStorage está vacío
const tareasIniciales = [
  { id: 1, nombre: 'Lavar ropa',    emoji: '🧺', frecuenciaDias: 3,  ultimaVez: haceDias(2) },
  { id: 2, nombre: 'Limpiar depa',  emoji: '🧹', frecuenciaDias: 7,  ultimaVez: haceDias(2) },
  { id: 3, nombre: 'Pagar tarjeta', emoji: '💳', frecuenciaDias: 30, ultimaVez: haceDias(2) },
]

// Lee tareas de localStorage; si no hay nada o hay error, devuelve el seed
function cargarTareas() {
  try {
    const guardadas = localStorage.getItem(CLAVE_STORAGE)
    if (guardadas) return JSON.parse(guardadas)
  } catch {}
  return tareasIniciales
}

// Escribe el array completo de tareas en localStorage
function persistir(tareas) {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(tareas))
}

// Hook central: único punto de acceso para leer y mutar tareas.
// Toda operación pasa por aquí — ningún componente llama a localStorage directamente.
export function useTareas() {
  const [tareas, setTareas] = useState(cargarTareas)

  // Centraliza setState + persistir para que nunca queden desincronizados.
  function actualizarTareas(nuevasTareas) {
    setTareas(nuevasTareas)
    persistir(nuevasTareas)
  }

  // Marca la tarea como completada hoy, reseteando su vida a 100%.
  function completarTarea(id) {
    actualizarTareas(
      tareas.map((t) => t.id === id ? { ...t, ultimaVez: new Date().toISOString() } : t)
    )
  }

  // Elimina la tarea del array por id.
  function eliminarTarea(id) {
    actualizarTareas(tareas.filter((t) => t.id !== id))
  }

  // Actualiza nombre, emoji y frecuencia de la tarea sin tocar ultimaVez.
  function editarTarea(id, { nombre, emoji, frecuenciaDias }) {
    actualizarTareas(
      tareas.map((t) => t.id === id ? { ...t, nombre, emoji, frecuenciaDias } : t)
    )
  }

  // Crea una nueva tarea con vida al 100% (ultimaVez = ahora) y la agrega al array.
  function agregarTarea({ nombre, emoji, frecuenciaDias }) {
    const nueva = {
      id: Date.now(),
      nombre,
      emoji,
      frecuenciaDias,
      ultimaVez: new Date().toISOString(),
    }
    actualizarTareas([...tareas, nueva])
  }

  return { tareas, completarTarea, eliminarTarea, editarTarea, agregarTarea }
}
