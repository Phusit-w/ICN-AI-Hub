import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom has no layout engine; the Thread scrolls itself to the latest message.
Element.prototype.scrollIntoView = function scrollIntoView() {}
window.scrollTo = function scrollTo() {}

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
