import { defineConfig } from 'vitest/config';
import { VitePluginNode } from 'vite-plugin-node';
import dts from 'vite-plugin-dts';
import path from 'path';

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
        branches: 75,
        functions: 89,
        lines: 89,
        statements: 89,
      },
    },
    deps: {
      inline: [/@fjell\/.*/],
    },
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