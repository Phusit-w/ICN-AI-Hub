// PROTOTYPE variant B: each Agent's Cube (see components/ui/EyeTracker.jsx): its body shape, eye style and body colour.
export const CUBE_SHAPES = ['Cube', 'Ball', 'Pill', 'Hexagon']
export const CUBE_EYES = ['Slant', 'Dots', 'Squares']
// navy, steel blue, teal, violet, amber, rose: all dark enough for the white eyes to read
export const CUBE_COLORS = ['#1e3a5f', '#3f6594', '#0f766e', '#7c3aed', '#b45309', '#be185d']

const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
const pick = (list, n) => list[n % list.length]

/** The Cube of `agent`: what it chose, and for anything unchosen a look worked out from its id so no two Agents match by default. */
export function cubeOf(agent) {
  const h = hash(agent?.id ?? '')
  return {
    shape: pick(CUBE_SHAPES, h), eyes: pick(CUBE_EYES, h >> 3), color: pick(CUBE_COLORS, h >> 5),
    ...agent?.cube,
  }
}
