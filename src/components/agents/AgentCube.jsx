// PROTOTYPE variant B: an Agent shown as its own Cube.
import { useEffect, useState } from 'react'
import EyeTracker from '../ui/EyeTracker'
import { cubeOf } from '../../lib/cube'

// where a thinking Cube glances, one after another
const GLANCES = [[-0.5, 0.25], [0.5, 0.25], [0.1, 0.5], [0.4, -0.1]]
const still = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * `agent` (or an explicit `cube`) picks the look. `idle`: ignores the pointer and glances now and then.
 * `calm`: for a card in a list; quiet, and wakes only while the pointer is over the card.
 * `thinking`: darts its eyes between spots, for an Agent at work. `mood`: 'sleep' (waiting) or 'done'.
 * `gaze`: [x, y] to hold a look. `message`: text kept in its bubble.
 */
export default function AgentCube({ agent, cube, size = 40, idle, calm, thinking, mood, gaze, message }) {
  const c = cube ?? cubeOf(agent)
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!thinking || still()) return undefined
    const t = setInterval(() => setI((n) => (n + 1) % GLANCES.length), 900)
    return () => clearInterval(t)
  }, [thinking])
  return (
    <span className="eyt-fit inline-flex">
      <EyeTracker
        size={size} idle={idle} calm={calm} shape={c.shape} eyes={c.eyes} color={c.color} eyeScale={size < 60 ? 1.3 : 1}
        accessory={size >= 48 ? c.accessory : 'none'} busy={thinking}
        mood={mood} gaze={thinking && !still() ? GLANCES[i] : gaze} message={message}
      />
    </span>
  )
}
