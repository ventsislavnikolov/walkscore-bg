import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/routes/**',
        'src/test/**',
        'src/**/*.test.*',
        'src/**/*.d.ts',
        'src/routeTree.gen.ts',
        'src/router.tsx',
        'src/server.ts',
        'src/server/supabase.ts',
        'src/components/HeatmapMap.tsx',
        'src/lib/types.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
})
