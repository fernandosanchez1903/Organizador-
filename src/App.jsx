import { useState } from 'react'
import './App.css'
import { useTareas } from './hooks/useTareas'
import { calcularVida } from './utils/tareas'
import TarjetaTarea from './components/TarjetaTarea'
import ModalTarea from './components/ModalTarea'
import BannerUrgente from './components/BannerUrgente'

// Orquesta el estado de UI (qué modal está abierto) y conecta el hook de datos
// con los componentes visuales. No contiene lógica de negocio ni acceso a localStorage.
export default function App() {
  const { tareas, completarTarea, eliminarTarea, editarTarea, agregarTarea } = useTareas()

  // null = sin modal · 'crear' = modal de nueva tarea · objeto tarea = modal de edición
  const [modalEstado, setModalEstado] = useState(null)

  // Wrapper necesario para pasar el id de la tarea que está en modalEstado
  // antes de cerrar el modal; el hook solo recibe (id, datos).
  function handleEditarTarea(datos) {
    editarTarea(modalEstado.id, datos)
    setModalEstado(null)
  }

  // Wrapper necesario para cerrar el modal después de agregar;
  // el hook no sabe nada del estado de la UI.
  function handleAgregarTarea(datos) {
    agregarTarea(datos)
    setModalEstado(null)
  }

  return (
    <div className="min-h-screen bg-zinc-900 px-6 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Organizador</h1>
        <p className="text-zinc-400 mt-1 text-sm">Tus tareas tienen vida. No las dejes morir.</p>
      </header>

      {/* Banner de tareas urgentes: se muestra arriba de la grilla si alguna tarea llegó a 0% */}
      <BannerUrgente tareas={tareas} calcularVida={calcularVida} />

      {/* Estado vacío: si no hay tareas, muestra un mensaje orientador en lugar de la grilla vacía */}
      {tareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 mt-24 text-center">
          <span className="text-6xl">📋</span>
          <p className="text-white font-semibold text-lg">No tienes tareas todavía</p>
          <p className="text-zinc-400 text-sm">Agrega una con el botón <span className="text-violet-400 font-bold">+</span> de abajo.</p>
        </div>
      ) : (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto pb-24">
          {/* Spread para no mutar el estado; sort ascendente por vida para que las más urgentes aparezcan primero */}
          {[...tareas].sort((a, b) => calcularVida(a.ultimaVez, a.frecuenciaDias) - calcularVida(b.ultimaVez, b.frecuenciaDias)).map((tarea) => (
            <TarjetaTarea
              key={tarea.id}
              nombre={tarea.nombre}
              emoji={tarea.emoji}
              vida={calcularVida(tarea.ultimaVez, tarea.frecuenciaDias)}
              frecuenciaDias={tarea.frecuenciaDias}
              ultimaVez={tarea.ultimaVez}
              onCompletar={() => completarTarea(tarea.id)}
              onEliminar={() => eliminarTarea(tarea.id)}
              onEditar={() => setModalEstado(tarea)}
            />
          ))}
        </main>
      )}

      <button
        onClick={() => setModalEstado('crear')}
        aria-label="Agregar tarea"
        className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-3xl rounded-full shadow-lg shadow-violet-900/50 transition-all flex items-center justify-center"
      >
        +
      </button>

      {/* Modal de creación: se abre cuando modalEstado es exactamente el string 'crear' */}
      {modalEstado === 'crear' && (
        <ModalTarea
          onGuardar={handleAgregarTarea}
          onCerrar={() => setModalEstado(null)}
        />
      )}

      {/* Modal de edición: se abre cuando modalEstado es un objeto tarea */}
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
