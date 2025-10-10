import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'examples/**/*.ts'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/index.ts',
      ],
      thresholds: {
        // Overall thresholds (including examples)
        statements: 91,
        branches: 85,
        functions: 77,
        lines: 91,
        // Specific thresholds for src/ directory
        'src/**/*.ts': {
          statements: 95,
          branches: 90,
          functions: 90,
          lines: 95,
        },
        // Relaxed thresholds for examples/
        'examples/**/*.ts': {
          statements: 80,
          branches: 65,
          functions: 55,
          lines: 80,
        },
      },
    },
    deps: {
      inline: [/@fjell\/.*/, /@fjell\/core/],
    },
  },
});
