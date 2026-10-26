import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// The Cube redraws itself every animation frame for ever, which fake time cannot run to the end. A still stand-in keeps journeys fast.
vi.mock('../src/components/ui/EyeTracker.jsx', () => ({ default: () => null }))

// jsdom has no layout engine; the Thread scrolls itself to the latest message.
Element.prototype.scrollIntoView = function scrollIntoView() {}
window.scrollTo = function scrollTo() {}

// Animated hints (the typewriter) restart on a timer for ever, which fake time cannot run to the end.
// Tests ask for reduced motion, so the hint shows its first phrase and sets no timers.
window.matchMedia = (query) => ({
  matches: query.includes('prefers-reduced-motion'), media: query, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})

// Testing Library only recognises Jest's fake timers. Without this shim its async wrapper waits on a
// real setTimeout(0) that vitest's fake clock never fires, and every user-event call hangs.
globalThis.jest = { advanceTimersByTime: (ms) => vi.advanceTimersByTime(ms) }

// Saved state (dismissed welcome card, remembered toggles) lives in browser storage.
// Clear it so every journey starts from the default mock data.
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
