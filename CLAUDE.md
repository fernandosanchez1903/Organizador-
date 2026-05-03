# Organizador - Tamagotchi de responsabilidades adultas

## Qué es
App personal para gestionar tareas recurrentes de vida adulta. Cada tarea tiene una "vida" que se degrada con el tiempo visualmente, como un Tamagotchi. El deterioro visual motiva completar las tareas antes de que "mueran".

## Stack
- React + Vite
- Tailwind CSS v4 (con plugin @tailwindcss/vite)
- localStorage para persistencia (sin backend, sin DB)

## Decisiones tomadas
- Sin backend, todo en el navegador
- Sin IA, catálogo fijo de tareas con su objeto/personaje asignado
- Los assets visuales se generarán con IA generativa en estilo pixel art consistente

## Convenciones
- Comentar cada función y componente
- Nombres de variables en español
- Componentes en PascalCase