#!/usr/bin/env node

import esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const sharedConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: false,
  sourcemap: true,
  target: 'es2022',
  platform: 'node',
  outdir: 'dist',
  tsconfig: './tsconfig.json',
  // Bundle all dependencies instead of marking them as external
  external: [],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
};

async function build() {
  try {
    const buildConfig = {
      ...sharedConfig,
      format: 'esm',
      outExtension: { '.js': '.js' },
      splitting: false,
    };

    if (isWatch) {
      console.log('👀 Starting watch mode...');
      const context = await esbuild.context(buildConfig);
      await context.watch();
      console.log('✅ Watching for changes...');
    } else {
      await esbuild.build(buildConfig);
      console.log('✅ Build completed successfully');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
