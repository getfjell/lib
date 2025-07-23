# Fjell Lib Documentation Website

This is the documentation website for [@fjell/lib](https://www.npmjs.com/package/@fjell/lib), built with React, TypeScript, and Vite.

## Development

### Prerequisites

- Node.js 22+
- pnpm

### Setup

```bash
# Install dependencies
cd docs
pnpm install

# Start development server
pnpm run dev
```

The site will be available at `http://localhost:3002`

### Building

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

## Deployment

The website is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow:

1. Builds the fjell-lib library
2. Copies documentation files (README, examples, release notes) to the public directory
3. Builds the React application with Vite
4. Deploys to GitHub Pages

## Structure

- `src/App.tsx` - Main application component with navigation and content rendering
- `src/main.tsx` - React application entry point
- `src/App.css` - Main stylesheet with responsive design
- `src/index.css` - Base styles and CSS variables
- `public/` - Static assets including the fjell icon
- `.github/workflows/deploy-docs.yml` - GitHub Pages deployment workflow

## Content Sections

The website includes four main sections:

1. **Foundation** - Core concepts and philosophy
2. **Getting Started** - First steps with Fjell Lib
3. **Examples** - Code examples and usage patterns
4. **Architecture** - Library design and patterns

Content is fetched from:
- Main README (generated during build)
- Examples README from `../examples/README.md`
- Release notes from `../RELEASE_NOTES.md`
- Package version from `../package.json`

## Features

- Responsive design for desktop and mobile
- Syntax highlighting for code blocks
- Fullscreen image viewing
- Navigation between sections
- Loading states
- Fallback content when files aren't available

The website follows the same design system as the fjell-registry documentation for consistency across the Fjell ecosystem.
