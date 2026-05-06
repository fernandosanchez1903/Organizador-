// Calcula el porcentaje de vida restante (0–100) basado en cuánto tiempo
// ha pasado desde la última vez que se completó la tarea vs. su frecuencia.
export function calcularVida(ultimaVez, frecuenciaDias) {
  const diasTranscurridos = (Date.now() - new Date(ultimaVez).getTime()) / 86_400_000
  return Math.max(0, Math.round(100 - (diasTranscurridos / frecuenciaDias) * 100))
}

// Devuelve cuántos días completos han pasado desde ultimaVez (número entero, mínimo 0).
export function diasDesde(ultimaVez) {
  return Math.floor((Date.now() - new Date(ultimaVez).getTime()) / 86_400_000)
}

// Devuelve la clase Tailwind de color de la barra según el porcentaje de vida:
// > 60 → verde, >= 30 → amarillo, < 30 → rojo.
export function colorBarra(vida) {
  if (vida > 60) return 'bg-green-500'
  if (vida >= 30) return 'bg-yellow-400'
  return 'bg-red-500'
}

// Valida que el string contenga al menos un carácter emoji real.
// Usa \p{Extended_Pictographic} porque cubre emojis pictográficos sin falsos
// positivos con dígitos (que técnicamente también son emoji en Unicode).
export function esEmoji(str) {
  return /\p{Extended_Pictographic}/u.test(str)
}
