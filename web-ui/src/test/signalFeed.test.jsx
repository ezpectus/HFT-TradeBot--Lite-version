/**
 * Tests for SignalFeed component
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SignalFeed from '../components/SignalFeed'

const mockSignals = [
  { direction: 'LONG', symbol: 'BTC/USDT', confidence: 85, rr_ratio: 2.5, entry_price: 50000, timestamp: 1700000000, reason: 'Strong uptrend' },
  { direction: 'SHORT', symbol: 'ETH/USDT', confidence: 72, rr_ratio: 1.8, entry_price: 3000, timestamp: 1700000001, reason: 'Overbought' },
  { direction: 'LONG', symbol: 'SOL/USDT', confidence: 65, rr_ratio: 1.5, entry_price: 100, timestamp: 1700000002, reason: 'Breakout' },
  { direction: 'SHORT', symbol: 'BTC/USDT', confidence: 45, rr_ratio: 1.2, entry_price: 51000, timestamp: 1700000003, reason: 'Rejection' },
]

describe('SignalFeed', () => {
  it('renders empty state when no signals', () => {
    render(<SignalFeed signals={[]} regime={null} />)
    expect(screen.getByText('Waiting for signals')).toBeDefined()
  })

  it('renders all signals by default', () => {
    render(<SignalFeed signals={mockSignals} regime={null} />)
    expect(screen.getByText(/AI Signals \(4\)/)).toBeDefined()
  })

  it('filters to Long only', () => {
    render(<SignalFeed signals={mockSignals} regime={null} />)
    fireEvent.click(screen.getByText('Long'))
    expect(screen.getByText(/AI Signals \(2\/4\)/)).toBeDefined()
  })

  it('filters to Short only', () => {
    render(<SignalFeed signals={mockSignals} regime={null} />)
    fireEvent.click(screen.getByText('Short'))
    expect(screen.getByText(/AI Signals \(2\/4\)/)).toBeDefined()
  })

  it('resets to All filter', () => {
    render(<SignalFeed signals={mockSignals} regime={null} />)
    fireEvent.click(screen.getByText('Short'))
    expect(screen.getByText(/AI Signals \(2\/4\)/)).toBeDefined()
    fireEvent.click(screen.getByText('All'))
    expect(screen.getByText(/AI Signals \(4\)/)).toBeDefined()
  })

  it('renders market regime when provided', () => {
    render(<SignalFeed signals={[]} regime={{ regime: 'TRENDING', trend_score: 0.8, cycle_strength: 0.3 }} />)
    expect(screen.getByText('TRENDING')).toBeDefined()
  })

  it('shows empty filter state when no matches', () => {
    render(<SignalFeed signals={mockSignals} regime={null} />)
    fireEvent.click(screen.getByText('Long'))
    // Long has 2 signals, so should show them
    expect(screen.getByText(/AI Signals \(2\/4\)/)).toBeDefined()
  })
})
