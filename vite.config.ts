import { defineConfig } from 'vitest/config';
import { VitePluginNode } from 'vite-plugin-node';
import dts from 'vite-plugin-dts';
import path from 'path';
import pkg from './package.json';

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
      ],
      thresholds: {
        branches: 93,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    deps: {
      inline: [/@fjell\/.*/, /@fjell\/core/],
    },
  },
  optimizeDeps: {
    include: [
      '@fjell/core',
      '@fjell/logging'
    ],
  },
  server: {
    port: 3000
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'swc',
    }),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      exclude: ['./tests/**/*.ts'],
      include: ['./src/**/*.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      external: Object.keys(pkg.dependencies || {}),
      input: 'src/index.ts',
      output: [
        {
          format: 'esm',
          entryFileNames: '[name].js',
          preserveModules: true,
          exports: 'named',
          sourcemap: 'inline',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: true,
          exports: 'named',
          sourcemap: 'inline',
        },
      ],
    },
    modulePreload: false,
    minify: false,
    sourcemap: true
  },
});
