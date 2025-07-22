import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import './App.css'

interface DocumentSection {
  id: string;
  title: string;
  subtitle: string;
  file: string;
  content?: string;
}

const documentSections: DocumentSection[] = [
  { id: 'overview', title: 'Foundation', subtitle: 'Core concepts & philosophy', file: '/lib/README.md' },
  { id: 'getting-started', title: 'Getting Started', subtitle: 'Your first steps with Fjell Lib', file: '/lib/examples-README.md' },
  { id: 'examples', title: 'Examples', subtitle: 'Code examples & usage patterns', file: '/lib/examples-README.md' },
  { id: 'architecture', title: 'Architecture', subtitle: 'Library design & patterns', file: '/lib/RELEASE_NOTES.md' }
];

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('overview')
  const [documents, setDocuments] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [version, setVersion] = useState<string>('4.4.13')

  useEffect(() => {
    const loadDocuments = async () => {
      const loadedDocs: { [key: string]: string } = {}

      for (const section of documentSections) {
        try {
          const response = await fetch(section.file)

          if (response.ok) {
            loadedDocs[section.id] = await response.text()
          } else {
            // Fallback content for missing files
            loadedDocs[section.id] = getFallbackContent(section.id)
          }
        } catch (error) {
          console.error(`Error loading ${section.file}:`, error)
          loadedDocs[section.id] = getFallbackContent(section.id)
        }
      }

      setDocuments(loadedDocs)
      setLoading(false)
    }

    const loadVersion = async () => {
      try {
        const response = await fetch('/lib/package.json')
        if (response.ok) {
          const packageData = await response.json()
          setVersion(packageData.version)
          console.log('Version loaded:', packageData.version)
        } else {
          console.error('Failed to fetch package.json:', response.status)
          setVersion('4.4.13') // Fallback version
        }
      } catch (error) {
        console.error('Error loading version:', error)
        setVersion('4.4.13') // Fallback version
      }
    }

    loadDocuments()
    loadVersion()
  }, [])

  const getFallbackContent = (sectionId: string): string => {
    switch (sectionId) {
      case 'overview':
        return `# Fjell Lib

Server-side Library for Fjell - A powerful TypeScript data operations and business logic system.
The Library provides comprehensive data model operations, business logic integration, and storage abstraction
for building scalable applications.

## Installation

\`\`\`bash
npm install @fjell/lib
\`\`\`

## Quick Start

\`\`\`typescript
import { createRegistry, createLibrary } from '@fjell/lib'

// Create a registry for your data models
const registry = createRegistry('business-models')

// Create a library instance for your data model
const userLibrary = createLibrary(
  registry,
  { keyType: 'user' },
  userOperations,
  userOptions
)

// Perform data operations
const user = await userLibrary.operations.create({
  name: 'Alice Johnson',
  email: 'alice@example.com'
})

const users = await userLibrary.operations.all({})
\`\`\`

## Core Concepts

- **Library**: Extends fjell-registry.Instance with data operations and business logic
- **Operations**: CRUD operations plus actions and facets for business logic
- **Registry**: Central coordination system from fjell-registry
- **Data Models**: Type-safe business entities with validation and hooks
- **Storage Integration**: Abstract interface for any storage backend`

      case 'getting-started':
        return `# Getting Started

## Basic Usage

\`\`\`typescript
import { createRegistry, createLibrary } from '@fjell/lib'

// Create a registry for data models
const registry = createRegistry('business-models')

// Define your data model operations
const userOperations = {
  all: async () => { /* fetch all users */ },
  create: async (data) => { /* create user */ },
  find: async (query) => { /* search users */ },
  // ... other CRUD operations
}

// Create a library instance
const userLibrary = createLibrary(
  registry,
  { keyType: 'user' },
  userOperations,
  {}
)
\`\`\`

## Key Features

- **Type Safety**: Full TypeScript support with generics
- **Storage Agnostic**: Works with any database or storage system
- **Business Logic**: Built-in support for actions and facets
- **Extensible**: Clean inheritance from fjell-registry.Instance
- **Validation**: Built-in data validation and hooks

## Examples

Check the examples directory for detailed patterns:
- Simple CRUD operations
- Multi-level hierarchical data
- Enterprise business applications
- Storage integrations`

      case 'examples':
        return `# Fjell Lib Examples

This directory contains examples demonstrating how to use fjell-lib for data operations and business logic.

## Available Examples

### 1. **simple-example.ts** - Start Here!
Perfect for beginners! Demonstrates basic CRUD operations:
- Basic data models (User, Task)
- Simple operations usage
- Registry and Library creation

### 2. **library-architecture-example.ts** - New Architecture Guide
Learn the new Library architecture introduced in v4.4.12+:
- Inheritance hierarchy from fjell-registry.Instance
- How fjell-lib extends the registry system
- Integration with database-specific libraries

### 3. **multi-level-keys.ts** - Advanced Hierarchical Data
Demonstrates complex data structures:
- Organization → Department → Employee hierarchy
- Location-based data organization
- Multi-dimensional queries

### 4. **enterprise-example.ts** - Full Business Application
Complete enterprise system demonstrating:
- Multiple interconnected models
- Business logic with actions and facets
- Analytics and reporting
- Real-world e-commerce patterns

## Quick Start

\`\`\`bash
# Run the simple example
npx tsx examples/simple-example.ts

# Learn the new architecture
npx tsx examples/library-architecture-example.ts
\`\`\`

Each example is fully documented with explanations of the patterns and concepts used.`

      case 'architecture':
        return `# Fjell Lib Architecture

## New Library Architecture (v4.4.12+)

Fjell-lib now uses a cleaner inheritance hierarchy:

\`\`\`typescript
// fjell-registry: Base coordination
import { createRegistry, Instance } from '@fjell/registry'

// fjell-lib: Data model operations
import { createLibrary, Library } from '@fjell/lib'

// Database-specific implementations
import { createSequelizeLibrary } from '@fjell/lib-sequelize'
import { createFirestoreLibrary } from '@fjell/lib-firestore'
\`\`\`

## Design Principles

- **Clean Inheritance**: Each level adds specific functionality
- **Type Safety**: Full TypeScript support throughout
- **Extensibility**: Easy to add new database implementations
- **Separation of Concerns**: Each library has a focused responsibility

## Architecture Benefits

- **Clear APIs**: Consistent interface across all data models
- **Storage Abstraction**: Works with any storage backend
- **Business Logic Integration**: Built-in support for actions and facets
- **Registry Coordination**: Leverages fjell-registry for service coordination

## Storage Integration

Fjell-lib is designed to work with any storage system:
- SQL databases (PostgreSQL, MySQL)
- NoSQL databases (MongoDB, DynamoDB)
- In-memory stores (Redis)
- File systems and cloud storage

The operations interface provides a clean abstraction that adapts to any backend.`

      default:
        return 'Documentation content not available.'
    }
  }

  const customComponents = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : 'text'

      return !inline && match ? (
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    img({ src, alt, ...props }: any) {
      const handleImageClick = () => {
        if (src) {
          setFullscreenImage(src)
        }
      }

      return (
        <img
          src={src}
          alt={alt}
          {...props}
          style={{ cursor: 'pointer', maxWidth: '100%', height: 'auto' }}
          onClick={handleImageClick}
        />
      )
    }
  }

  const currentDoc = documents[currentSection] || ''

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading Fjell Lib documentation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <div className="mobile-brand">
            <img src="/lib/fjell-icon.svg" alt="Fjell" className="mobile-logo" />
            <span className="mobile-title">Fjell Lib</span>
            <span className="mobile-version">v{version}</span>
          </div>
          <button
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <img src="/lib/fjell-icon.svg" alt="Fjell" className="logo" />
            <div className="brand-text">
              <span className="brand-title">Fjell Lib</span>
              <span className="brand-subtitle">Server-side Library</span>
            </div>
          </div>
          <div className="version-badge">v{version}</div>
        </div>

        <div className="nav-sections">
          {documentSections.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${currentSection === section.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentSection(section.id)
                setSidebarOpen(false)
              }}
            >
              <div className="nav-item-content">
                <span className="nav-title">{section.title}</span>
                <span className="nav-subtitle">{section.subtitle}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="footer-links">
            <a href="https://github.com/getfjell/lib" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/@fjell/lib" target="_blank" rel="noopener noreferrer">
              NPM
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={customComponents}
            >
              {currentDoc}
            </ReactMarkdown>
          </div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={() => setFullscreenImage(null)}>
          <div className="fullscreen-content">
            <img src={fullscreenImage} alt="Fullscreen view" />
            <button
              className="fullscreen-close"
              onClick={() => setFullscreenImage(null)}
              aria-label="Close fullscreen"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
