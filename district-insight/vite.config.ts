import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 99,
        functions: 97,
        branches: 88,
        statements: 99,
      },
      exclude: [
        'node_modules/',
        'src/test/',
        'src/main.tsx',
        '*.config.*',
        'dist/',
      ],
    },
  },
})
