import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative asset paths so the static build works from any folder or host.
  base: './',
  // IPv4 loopback: on this machine "localhost" resolved to ::1 only, which Chrome couldn't reach.
  server: { host: '127.0.0.1' },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.{js,jsx}'],
    // Whole-app journeys advance Runs on fake timers; give slow machines room.
    testTimeout: 20000,
  },
})
