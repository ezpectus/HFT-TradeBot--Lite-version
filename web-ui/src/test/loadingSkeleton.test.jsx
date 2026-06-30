/**
 * Tests for LoadingSkeleton components
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkeletonRow, SkeletonCard, SkeletonTable, LoadingSpinner, EmptyState } from '../components/LoadingSkeleton'
import { Activity } from 'lucide-react'

describe('SkeletonRow', () => {
  it('renders with default width', () => {
    const { container } = render(<SkeletonRow />)
    const el = container.firstChild
    expect(el).toBeDefined()
    expect(el.className).toContain('skeleton')
  })

  it('accepts numeric width and height', () => {
    const { container } = render(<SkeletonRow width={100} height={20} />)
    const el = container.firstChild
    expect(el.style.width).toBe('100px')
    expect(el.style.height).toBe('20px')
  })

  it('accepts string width', () => {
    const { container } = render(<SkeletonRow width="50%" />)
    const el = container.firstChild
    expect(el.style.width).toBe('50%')
  })
})

describe('SkeletonCard', () => {
  it('renders specified number of rows', () => {
    const { container } = render(<SkeletonCard rows={4} />)
    const rows = container.querySelectorAll('.skeleton')
    expect(rows.length).toBe(4)
  })
})

describe('SkeletonTable', () => {
  it('renders correct number of cells', () => {
    const { container } = render(<SkeletonTable rows={3} cols={4} />)
    const cells = container.querySelectorAll('.skeleton')
    // header row (4) + 3 data rows (4 each) = 16
    expect(cells.length).toBe(16)
  })
})

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />)
    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
    expect(svg.getAttribute('width')).toBe('16')
  })

  it('renders with label', () => {
    render(<LoadingSpinner label="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeDefined()
  })

  it('renders with custom size', () => {
    const { container } = render(<LoadingSpinner size={32} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('32')
  })
})

describe('EmptyState', () => {
  it('renders title and subtitle', () => {
    const { getByText } = render(<EmptyState title="No data" subtitle="Try again later" />)
    expect(getByText('No data')).toBeDefined()
    expect(getByText('Try again later')).toBeDefined()
  })

  it('renders icon when provided', () => {
    const { container } = render(<EmptyState icon={Activity} title="No activity" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
  })
})
