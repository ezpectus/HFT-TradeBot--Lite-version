/**
 * Tests for TradeTimeline component
 * Tests: empty state, fill rendering, summary stats, filtering, buy/sell display
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TradeTimeline from '../components/TradeTimeline'

function makeFill(id, side, price, qty, exchange = 'binance', symbol = 'BTC/USDT') {
  return {
    id,
    side,
    price,
    quantity: qty,
    exchange,
    symbol,
    status: 'FILLED',
    timestamp: Date.now(),
  }
}

describe('TradeTimeline', () => {
  it('renders empty state when no fills', () => {
    render(<TradeTimeline fills={[]} />)
    expect(screen.getByText('No fills yet')).toBeInTheDocument()
  })

  it('renders empty state when fills is null', () => {
    render(<TradeTimeline fills={null} />)
    expect(screen.getByText('No fills yet')).toBeInTheDocument()
  })

  it('renders header label', () => {
    render(<TradeTimeline fills={[]} />)
    expect(screen.getByText('Execution Timeline')).toBeInTheDocument()
  })

  it('renders fill entries for FILLED orders', () => {
    const fills = [
      makeFill(1, 'BUY', 50000, 0.5),
      makeFill(2, 'SELL', 51000, 0.3),
    ]
    render(<TradeTimeline fills={fills} />)
    expect(screen.getByText('BUY')).toBeInTheDocument()
    expect(screen.getByText('SELL')).toBeInTheDocument()
  })

  it('filters out non-FILLED orders', () => {
    const fills = [
      makeFill(1, 'BUY', 50000, 0.5),
      { ...makeFill(2, 'SELL', 51000, 0.3), status: 'PENDING' },
    ]
    render(<TradeTimeline fills={fills} />)
    expect(screen.getByText('BUY')).toBeInTheDocument()
    expect(screen.queryByText('SELL')).not.toBeInTheDocument()
  })

  it('filters by symbol', () => {
    const fills = [
      makeFill(1, 'BUY', 50000, 0.5, 'binance', 'BTC/USDT'),
      makeFill(2, 'SELL', 3000, 1.0, 'binance', 'ETH/USDT'),
    ]
    render(<TradeTimeline fills={fills} symbol="BTC/USDT" />)
    expect(screen.getByText('BUY')).toBeInTheDocument()
    expect(screen.queryByText('SELL')).not.toBeInTheDocument()
  })

  it('filters by exchange', () => {
    const fills = [
      makeFill(1, 'BUY', 50000, 0.5, 'binance'),
      makeFill(2, 'SELL', 51000, 0.3, 'bybit'),
    ]
    render(<TradeTimeline fills={fills} selectedExchange="binance" />)
    expect(screen.getByText('BUY')).toBeInTheDocument()
    expect(screen.queryByText('SELL')).not.toBeInTheDocument()
  })

  it('shows summary with total fills count', () => {
    const fills = [
      makeFill(1, 'BUY', 50000, 0.5),
      makeFill(2, 'SELL', 51000, 0.3),
    ]
    render(<TradeTimeline fills={fills} />)
    expect(screen.getByText('2 fills')).toBeInTheDocument()
  })

  it('shows buy count in summary', () => {
    const fills = [
      makeFill(1, 'BUY', 50000, 0.5),
      makeFill(2, 'BUY', 51000, 0.3),
      makeFill(3, 'SELL', 52000, 0.2),
    ]
    render(<TradeTimeline fills={fills} />)
    expect(screen.getByText('2 buy')).toBeInTheDocument()
  })

  it('shows sell count in summary', () => {
    const fills = [
      makeFill(1, 'BUY', 50000, 0.5),
      makeFill(2, 'SELL', 51000, 0.3),
      makeFill(3, 'SELL', 52000, 0.2),
    ]
    render(<TradeTimeline fills={fills} />)
    expect(screen.getByText('2 sell')).toBeInTheDocument()
  })

  it('shows total volume in summary', () => {
    const fills = [
      makeFill(1, 'BUY', 50000, 1.0),  // 50000
      makeFill(2, 'SELL', 51000, 2.0), // 102000
    ]
    render(<TradeTimeline fills={fills} />)
    // Total volume = 50000 + 102000 = 152000
    expect(screen.getByText('$152000.00')).toBeInTheDocument()
  })

  it('does not show summary when no fills', () => {
    render(<TradeTimeline fills={[]} />)
    expect(screen.queryByText(/fills$/)).not.toBeInTheDocument()
  })

  it('handles missing price gracefully', () => {
    const fills = [
      { ...makeFill(1, 'BUY', 0, 0.5), price: null },
    ]
    render(<TradeTimeline fills={fills} />)
    // Should not crash, volume should be 0
    expect(screen.getByText('BUY')).toBeInTheDocument()
  })

  it('handles missing quantity gracefully', () => {
    const fills = [
      { ...makeFill(1, 'BUY', 50000, 0), quantity: null },
    ]
    render(<TradeTimeline fills={fills} />)
    expect(screen.getByText('BUY')).toBeInTheDocument()
  })

  it('limits to 15 most recent fills', () => {
    const fills = []
    for (let i = 0; i < 20; i++) {
      fills.push(makeFill(i, 'BUY', 50000 + i, 0.1))
    }
    render(<TradeTimeline fills={fills} />)
    // Summary should show 15 (the limited count)
    expect(screen.getByText('15 fills')).toBeInTheDocument()
  })
})
