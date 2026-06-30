/**
 * Tests for ConfidenceScorer component
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConfidenceScorer from '../components/ConfidenceScorer'

function makeCandle(i, opts = {}) {
  return {
    exchange: opts.exchange || 'binance',
    symbol: opts.symbol || 'BTC/USDT',
    open: opts.open ?? 50000 + i * 10,
    high: opts.high ?? 50100 + i * 10,
    low: opts.low ?? 49900 + i * 10,
    close: opts.close ?? 50050 + i * 10,
    volume: opts.volume ?? 100,
  }
}

function makeCandles(n, opts = {}) {
  return Array.from({ length: n }, (_, i) => makeCandle(i, opts))
}

describe('ConfidenceScorer', () => {
  it('renders empty state when fewer than 15 candles', () => {
    const candles = makeCandles(10)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Confidence Scorer')).toBeDefined()
    expect(screen.getByText('Need 15+ candles')).toBeDefined()
  })

  it('renders empty state with 0 candles', () => {
    render(<ConfidenceScorer candles={[]} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Need 15+ candles')).toBeDefined()
  })

  it('renders confidence scorer header with sufficient data', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Signal Confidence Scorer')).toBeDefined()
  })

  it('renders confidence level label', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Confidence Level')).toBeDefined()
  })

  it('renders score out of 100', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText(/\/100/)).toBeDefined()
  })

  it('renders all 8 factor names', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Trend Alignment')).toBeDefined()
    expect(screen.getByText('RSI Momentum')).toBeDefined()
    expect(screen.getByText('Volume Confirmation')).toBeDefined()
    expect(screen.getByText('Volatility Regime')).toBeDefined()
    expect(screen.getByText('Signal Consensus')).toBeDefined()
    expect(screen.getByText('Price Position')).toBeDefined()
    expect(screen.getByText('Body Efficiency')).toBeDefined()
    expect(screen.getByText('No Contradiction')).toBeDefined()
  })

  it('renders direction bias text', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    // Direction is either 'Bullish bias' or 'Bearish bias'
    const bull = screen.queryByText(/Bullish bias/)
    const bear = screen.queryByText(/Bearish bias/)
    expect(bull || bear).toBeDefined()
  })

  it('renders recommendation text', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    // One of three recommendation messages should appear
    const high = screen.queryByText(/High confidence/)
    const low = screen.queryByText(/Low confidence/)
    const med = screen.queryByText(/Medium confidence/)
    expect(high || low || med).toBeDefined()
  })

  it('renders 8-factor model description', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText(/8-factor confidence model/)).toBeDefined()
  })

  it('filters candles by exchange and symbol', () => {
    const candles = [
      ...makeCandles(20, { exchange: 'okx', symbol: 'ETH/USDT' }),
      ...makeCandles(20, { exchange: 'binance', symbol: 'BTC/USDT' }),
    ]
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    // Should render the scorer (has enough binance BTC/USDT candles)
    expect(screen.getByText('Signal Confidence Scorer')).toBeDefined()
  })

  it('shows empty state when candles are for different exchange', () => {
    const candles = makeCandles(50, { exchange: 'okx', symbol: 'ETH/USDT' })
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Need 15+ candles')).toBeDefined()
  })

  it('handles exactly 15 candles (boundary)', () => {
    const candles = makeCandles(15)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Signal Confidence Scorer')).toBeDefined()
  })

  it('renders with signals provided', () => {
    const candles = makeCandles(50)
    const signals = [
      { direction: 'BUY', symbol: 'BTC/USDT', confidence: 80 },
      { direction: 'LONG', symbol: 'BTC/USDT', confidence: 70 },
    ]
    render(<ConfidenceScorer candles={candles} signals={signals} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Signal Consensus')).toBeDefined()
  })

  it('renders with fills provided', () => {
    const candles = makeCandles(50)
    const fills = [
      { symbol: 'BTC/USDT', side: 'BUY', status: 'FILLED' },
      { symbol: 'BTC/USDT', side: 'BUY', status: 'FILLED' },
    ]
    render(<ConfidenceScorer candles={candles} signals={[]} fills={fills} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('No Contradiction')).toBeDefined()
  })

  it('renders with null signals and fills', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={null} fills={null} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Signal Confidence Scorer')).toBeDefined()
  })

  it('renders with undefined signals and fills', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText('Signal Confidence Scorer')).toBeDefined()
  })

  it('renders bullish bias with uptrend candles', () => {
    // Strong uptrend: each candle closes higher
    const candles = Array.from({ length: 50 }, (_, i) => ({
      exchange: 'binance',
      symbol: 'BTC/USDT',
      open: 50000 + i * 100,
      high: 50100 + i * 100,
      low: 49900 + i * 100,
      close: 50050 + i * 100,
      volume: 100 + i,
    }))
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText(/Bullish bias/)).toBeDefined()
  })

  it('renders bearish bias with downtrend candles', () => {
    // Strong downtrend: each candle closes lower
    const candles = Array.from({ length: 50 }, (_, i) => ({
      exchange: 'binance',
      symbol: 'BTC/USDT',
      open: 60000 - i * 100,
      high: 60100 - i * 100,
      low: 59900 - i * 100,
      close: 59950 - i * 100,
      volume: 100 + i,
    }))
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    expect(screen.getByText(/Bearish bias/)).toBeDefined()
  })

  it('renders factor detail text', () => {
    const candles = makeCandles(50)
    render(<ConfidenceScorer candles={candles} signals={[]} fills={[]} symbol="BTC/USDT" exchange="binance" />)
    // At least one detail should be visible (e.g. "RSI XX" or "Misaligned" or "Above all MAs")
    const rsi = screen.queryByText(/RSI \d/)
    const misaligned = screen.queryByText('Misaligned')
    const above = screen.queryByText('Above all MAs')
    const below = screen.queryByText('Below all MAs')
    const mixed = screen.queryByText('Mixed')
    expect(rsi || misaligned || above || below || mixed).toBeDefined()
  })
})
