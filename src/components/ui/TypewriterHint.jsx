import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

// Grapheme split so Thai vowels and tone marks appear together with their consonant.
const graphemes = (s) => (typeof Intl.Segmenter === 'function'
  ? [...new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(s)].map((g) => g.segment)
  : Array.from(s))

/** Types each phrase out, pauses, erases it, then moves to the next. Paused while `active` is false. */
function useTypewriter(phrases, active) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (!active) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShown(phrases[0]); return undefined }
    const chars = phrases.map(graphemes)
    let i = 0, n = 0, erasing = false, timer
    const tick = () => {
      const c = chars[i]
      let delay = erasing ? 20 : 55
      if (!erasing && ++n === c.length) { erasing = true; delay = 1800 }
      else if (erasing && --n === 0) { erasing = false; i = (i + 1) % chars.length; delay = 400 }
      setShown(c.slice(0, n).join(''))
      timer = setTimeout(tick, delay)
    }
    timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
  }, [phrases, active])
  return shown
}

/**
 * Animated "เช่น …" hint laid over an empty text field (the field's own placeholder can't animate).
 * Render it inside a `relative` wrapper next to the field, only while the field is empty.
 * `phrases` must be a stable array (module constant) or the animation restarts every render.
 */
export default function TypewriterHint({ phrases, className }) {
  const typed = useTypewriter(phrases, true)
  return (
    <p aria-hidden className={cn('pointer-events-none absolute inset-0 truncate text-slate-400', className)}>
      เช่น {typed}<span className="ml-px inline-block h-[1.1em] w-px animate-pulse bg-slate-400 align-middle" />
    </p>
  )
}
