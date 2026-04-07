import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

describe('Header', () => {
  it('renders logo', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    expect(screen.getByText('DistrictInsight')).toBeTruthy()
  })
  it('renders nav links', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    expect(screen.getByText('Find Districts')).toBeTruthy()
    expect(screen.getByText('Compare')).toBeTruthy()
    expect(screen.getByText('For Educators')).toBeTruthy()
  })
  it('renders Get Started button', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    expect(screen.getByText('Get Started')).toBeTruthy()
  })
})

describe('Footer', () => {
  it('renders app name', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText('DistrictInsight')).toBeTruthy()
  })
  it('renders Urban Institute link', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText('Urban Institute Education Data Portal')).toBeTruthy()
  })
  it('renders nav links', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText('Find Districts')).toBeTruthy()
    expect(screen.getByText('Compare Districts')).toBeTruthy()
  })
})
