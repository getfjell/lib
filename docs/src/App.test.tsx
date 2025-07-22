import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders loading state initially', () => {
    render(<App />)
    expect(screen.getByText('Loading Fjell Lib documentation...')).toBeInTheDocument()
  })

  it('renders the Fjell Lib brand', () => {
    render(<App />)
    expect(screen.getByText('Fjell Lib')).toBeInTheDocument()
    expect(screen.getByText('Server-side Library')).toBeInTheDocument()
  })

  it('renders navigation sections', () => {
    render(<App />)
    expect(screen.getByText('Foundation')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Examples')).toBeInTheDocument()
    expect(screen.getByText('Architecture')).toBeInTheDocument()
  })

  it('renders footer links', () => {
    render(<App />)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('NPM')).toBeInTheDocument()
  })
})
