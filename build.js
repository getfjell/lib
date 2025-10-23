import buildLibrary from '@fjell/common-config/esbuild/library';

// Build JS only - custom type generation handled by separate tsc command
buildLibrary({
  generateTypes: false // Disable auto type generation
});
