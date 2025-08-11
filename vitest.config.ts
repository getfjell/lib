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
        statements: 91,
        branches: 83,
        functions: 77,
        lines: 91,
      },
    },
    deps: {
      inline: [/@fjell\/.*/, /@fjell\/core/],
    },
  },
});
