/**
 * Tests for OrderForm validation
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OrderForm from '../components/OrderForm'

const defaultProps = {
  exchange: 'binance',
  symbol: 'BTC/USDT',
  currentPrice: 50000,
  onSubmit: vi.fn(() => true),
  connected: true,
  balance: 10000,
}

describe('OrderForm', () => {
  it('renders with exchange and symbol', () => {
    render(<OrderForm {...defaultProps} />)
    expect(screen.getByText('Place Order')).toBeDefined()
    expect(screen.getByText(/binance.*BTC\/USDT/)).toBeDefined()
  })

  it('shows quantity validation error for zero', () => {
    render(<OrderForm {...defaultProps} />)
    const qtyInput = screen.getByDisplayValue('0.01')
    fireEvent.change(qtyInput, { target: { value: '0' } })
    expect(screen.getByText('Quantity must be > 0')).toBeDefined()
  })

  it('shows margin warning when margin exceeds balance', () => {
    render(<OrderForm {...defaultProps} />)
    const qtyInput = screen.getByDisplayValue('0.01')
    // qty * price / leverage > balance
    // 10 * 50000 / 10 = 50000 > 10000
    fireEvent.change(qtyInput, { target: { value: '10' } })
    expect(screen.getByText('Margin exceeds available balance')).toBeDefined()
  })

  it('disables submit when not connected', () => {
    render(<OrderForm {...defaultProps} connected={false} />)
    const submitBtn = screen.getByRole('button', { name: /BUY.*BTC\/USDT/ })
    expect(submitBtn.disabled).toBe(true)
  })

  it('disables submit with invalid quantity', () => {
    render(<OrderForm {...defaultProps} />)
    const qtyInput = screen.getByDisplayValue('0.01')
    fireEvent.change(qtyInput, { target: { value: '0' } })
    const submitBtn = screen.getByRole('button', { name: /BUY.*0.*BTC\/USDT/ })
    expect(submitBtn.disabled).toBe(true)
  })

  it('toggles between BUY and SELL', () => {
    render(<OrderForm {...defaultProps} />)
    fireEvent.click(screen.getByText('SELL / SHORT'))
    const submitBtn = screen.getByRole('button', { name: /SELL.*BTC\/USDT/ })
    expect(submitBtn).toBeDefined()
  })

  it('sets quantity from balance percentage', () => {
    render(<OrderForm {...defaultProps} />)
    fireEvent.click(screen.getByText('25%'))
    const qtyInput = screen.getByDisplayValue(/0\.0/)
    expect(qtyInput).toBeDefined()
  })
})
