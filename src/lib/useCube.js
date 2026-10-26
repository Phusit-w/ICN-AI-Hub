// The Cube mascot (EyeTracker) can be switched off by the user; one module-level value, so every page and the toggle agree.
import { useSyncExternalStore } from 'react'

const CUBE_KEY = 'icn-cube'
const readCube = () => { try { return localStorage.getItem(CUBE_KEY) !== 'off' } catch { return true } }
let cubeOn = readCube()
const cubeListeners = new Set()

export function useCube() {
  const on = useSyncExternalStore((fn) => { cubeListeners.add(fn); return () => cubeListeners.delete(fn) }, () => cubeOn)
  const set = (next) => {
    cubeOn = next
    try { localStorage.setItem(CUBE_KEY, next ? 'on' : 'off') } catch { /* ignore */ }
    cubeListeners.forEach((fn) => fn())
  }
  return [on, set]
}
