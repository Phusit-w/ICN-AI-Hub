import { useState } from 'react'

/**
 * useState that survives reloads via localStorage — for per-viewer UI conveniences only
 * (a remembered toggle or mode). Falls back to `initial` when storage is unavailable or holds junk.
 */
export default function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })
  const set = (next) => {
    setValue(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* storage unavailable — value resets on reload */ }
  }
  return [value, set]
}
