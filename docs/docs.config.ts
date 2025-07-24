import { DocsConfig } from '@fjell/docs-template';

const config: DocsConfig = {
  projectName: 'Fjell Lib',
  basePath: '/lib/',
  port: 3001,
  branding: {
    theme: 'lib',
    tagline: 'Server-side Library for Fjell',
    backgroundImage: '/pano.png',
    github: 'https://github.com/getfjell/fjell-lib',
    npm: 'https://www.npmjs.com/package/@fjell/lib'
  },
  sections: [
    {
      id: 'overview',
      title: 'Foundation',
      subtitle: 'Core concepts & philosophy',
      file: '/README.md'
    },
    {
      id: 'examples',
      title: 'Examples',
      subtitle: 'Code examples & usage patterns',
      file: '/examples-README.md'
    }
  ],
  filesToCopy: [
    {
      source: '../docs/README.md',
      destination: 'public/README.md'
    },
    {
      source: '../examples/README.md',
      destination: 'public/examples-README.md'
    }
  ],
  plugins: [],
  version: {
    source: 'package.json'
  }
}

export default config
