import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Tests unitaires uniquement — Playwright gère l'E2E
    include: ['tests/unit/**/*.test.js'],
    environment: 'jsdom',
    setupFiles: ['tests/unit/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/sw.js', 'src/main.js'],
      thresholds: {
        statements: 20,
        branches: 10,
        functions: 20,
        lines: 20,
      },
    },
  },
});
