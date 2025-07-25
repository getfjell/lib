import buildLibrary from '@fjell/eslint-config/esbuild/library';

// Build JS only - custom type generation handled by separate tsc command
buildLibrary({
  buildOptions: {
    generateTypes: false // Disable auto type generation
  }
});
