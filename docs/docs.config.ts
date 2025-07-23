interface DocsConfig {
  projectName: string;
  basePath: string;
  port: number;
  branding: {
    theme: string;
    tagline: string;
    logo?: string;
    backgroundImage?: string;
    primaryColor?: string;
    accentColor?: string;
    github?: string;
    npm?: string;
  };
  sections: Array<{
    id: string;
    title: string;
    subtitle: string;
    file: string;
  }>;
  filesToCopy: Array<{
    source: string;
    destination: string;
  }>;
  plugins?: any[];
  version: {
    source: string;
  };
  customContent?: {
    [key: string]: (content: string) => string;
  };
}

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
      file: '/lib/README.md'
    },
    {
      id: 'examples',
      title: 'Examples',
      subtitle: 'Code examples & usage patterns',
      file: '/lib/examples-README.md'
    },
    {
      id: 'release-notes',
      title: 'Release Notes',
      subtitle: 'Latest updates & changes',
      file: '/lib/RELEASE_NOTES.md'
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
    },
    {
      source: '../RELEASE_NOTES.md',
      destination: 'public/RELEASE_NOTES.md'
    }
  ],
  plugins: [],
  version: {
    source: 'package.json'
  }
}

export default config
