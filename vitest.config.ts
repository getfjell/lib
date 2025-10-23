import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/index.ts',
        'src/contained/index.ts',
        'src/primary/index.ts',
        'src/processing/index.ts',
        'examples/**/*.ts',
      ],
      thresholds: {
        // Overall thresholds (src only, no examples)
        statements: 95,
        branches: 85,
        functions: 90,
        lines: 95,
      },
    },
    deps: {
      inline: [/@fjell\/.*/, /@fjell\/core/],
    },
  },
});
