import { useState } from 'react'
import './App.css'
import { useTareas } from './hooks/useTareas'
import { calcularVida } from './utils/tareas'
import ZonaPersonaje from './components/ZonaPersonaje'
import ZonaTareas from './components/ZonaTareas'
import ModalTarea from './components/ModalTarea'

// Orquesta el estado de UI (modal abierto) y conecta el hook de datos con los componentes.
// No contiene lógica de negocio ni acceso a localStorage.
export default function App() {
  const { tareas, completarTarea, eliminarTarea, editarTarea, agregarTarea } = useTareas()

  // null = sin modal · 'crear' = modal nueva tarea · objeto tarea = modal edición
  const [modalEstado, setModalEstado] = useState(null)

  // Promedio de vida de todas las tareas; 100 si no hay tareas (personaje sano por defecto)
  const vidaGeneral = tareas.length > 0
    ? Math.round(
        tareas.reduce((suma, t) => suma + calcularVida(t.ultimaVez, t.frecuenciaDias), 0) / tareas.length
      )
    : 100

  // Tareas ordenadas de menor a mayor vida (más urgentes primero)
  const tareasOrdenadas = [...tareas].sort(
    (a, b) => calcularVida(a.ultimaVez, a.frecuenciaDias) - calcularVida(b.ultimaVez, b.frecuenciaDias)
  )

  function handleEditarTarea(datos) {
    editarTarea(modalEstado.id, datos)
    setModalEstado(null)
  }

  function handleAgregarTarea(datos) {
    agregarTarea(datos)
    setModalEstado(null)
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }} className="bg-zinc-950">
      <ZonaPersonaje vidaGeneral={vidaGeneral} />
      <ZonaTareas
        tareas={tareasOrdenadas}
        onCompletar={completarTarea}
        onEliminar={eliminarTarea}
        onEditar={(tarea) => setModalEstado(tarea)}
      />

      {/* FAB flotante, z-index mayor que ZonaTareas para no quedar tapado */}
      <button
        onClick={() => setModalEstado('crear')}
        aria-label="Agregar tarea"
        className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-3xl rounded-full shadow-lg shadow-violet-900/60 transition-all flex items-center justify-center"
        style={{ zIndex: 50 }}
      >
        +
      </button>

      {modalEstado === 'crear' && (
        <ModalTarea onGuardar={handleAgregarTarea} onCerrar={() => setModalEstado(null)} />
      )}
      {modalEstado && modalEstado !== 'crear' && (
        <ModalTarea
          tareaInicial={modalEstado}
          onGuardar={handleEditarTarea}
          onCerrar={() => setModalEstado(null)}
        />
      )}
    </div>
  )
}
