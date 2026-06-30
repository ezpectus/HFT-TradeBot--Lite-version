/**
 * Tests for ReplayControls component
 * Tests: play/pause toggle, scrub slider, step buttons, conditional rendering,
 * debounce behavior, max offset calculation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReplayControls from '../components/ReplayControls'

describe('ReplayControls', () => {
  const defaultProps = {
    paused: false,
    onToggle: vi.fn(),
    onScrub: vi.fn(),
    candleCount: 100,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders replay mode label', () => {
    render(<ReplayControls {...defaultProps} />)
    expect(screen.getByText('Replay Mode')).toBeInTheDocument()
  })

  it('shows Pause button when not paused', () => {
    render(<ReplayControls {...defaultProps} />)
    expect(screen.getByText('Pause')).toBeInTheDocument()
  })

  it('shows Resume button when paused', () => {
    render(<ReplayControls {...defaultProps} paused={true} />)
    expect(screen.getByText('Resume')).toBeInTheDocument()
  })

  it('calls onToggle when toggle button clicked', () => {
    const onToggle = vi.fn()
    render(<ReplayControls {...defaultProps} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Pause'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('hides scrub controls when not paused', () => {
    render(<ReplayControls {...defaultProps} />)
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    expect(screen.queryByText(/Scrub:/)).not.toBeInTheDocument()
  })

  it('shows scrub slider when paused', () => {
    render(<ReplayControls {...defaultProps} paused={true} />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('shows step back/forward buttons when paused', () => {
    render(<ReplayControls {...defaultProps} paused={true} />)
    expect(screen.getByTitle('Step back 10 candles')).toBeInTheDocument()
    expect(screen.getByTitle('Step forward 10 candles')).toBeInTheDocument()
  })

  it('hides step buttons when not paused', () => {
    render(<ReplayControls {...defaultProps} />)
    expect(screen.queryByTitle('Step back 10 candles')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Step forward 10 candles')).not.toBeInTheDocument()
  })

  it('shows paused message when paused', () => {
    render(<ReplayControls {...defaultProps} paused={true} />)
    expect(screen.getByText('Simulation paused — scrub to view history')).toBeInTheDocument()
  })

  it('hides paused message when not paused', () => {
    render(<ReplayControls {...defaultProps} />)
    expect(screen.queryByText('Simulation paused — scrub to view history')).not.toBeInTheDocument()
  })

  it('displays max offset from candleCount', () => {
    render(<ReplayControls {...defaultProps} paused={true} candleCount={50} />)
    expect(screen.getByText('max 49')).toBeInTheDocument()
  })

  it('handles zero candleCount gracefully', () => {
    render(<ReplayControls {...defaultProps} paused={true} candleCount={0} />)
    expect(screen.getByText('max 0')).toBeInTheDocument()
  })

  it('handles single candle (max offset = 0)', () => {
    render(<ReplayControls {...defaultProps} paused={true} candleCount={1} />)
    expect(screen.getByText('max 0')).toBeInTheDocument()
  })

  it('debounces onScrub when slider changes', () => {
    const onScrub = vi.fn()
    render(<ReplayControls {...defaultProps} paused={true} onScrub={onScrub} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '25' } })
    // Should not call immediately
    expect(onScrub).not.toHaveBeenCalled()
    // After 200ms debounce
    vi.advanceTimersByTime(200)
    expect(onScrub).toHaveBeenCalledWith(25)
  })

  it('step back button increases scrub offset by 10', () => {
    const onScrub = vi.fn()
    render(<ReplayControls {...defaultProps} paused={true} onScrub={onScrub} candleCount={100} />)
    const stepBack = screen.getByTitle('Step back 10 candles')
    fireEvent.click(stepBack)
    vi.advanceTimersByTime(200)
    expect(onScrub).toHaveBeenCalledWith(10)
  })

  it('step forward button decreases scrub offset by 10', () => {
    const onScrub = vi.fn()
    render(<ReplayControls {...defaultProps} paused={true} onScrub={onScrub} candleCount={100} />)
    // First scrub to 20
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '20' } })
    vi.advanceTimersByTime(200)
    onScrub.mockClear()
    // Then step forward (decrease offset)
    const stepForward = screen.getByTitle('Step forward 10 candles')
    fireEvent.click(stepForward)
    vi.advanceTimersByTime(200)
    expect(onScrub).toHaveBeenCalledWith(10)
  })

  it('step back does not exceed max offset', () => {
    const onScrub = vi.fn()
    render(<ReplayControls {...defaultProps} paused={true} onScrub={onScrub} candleCount={15} />)
    // max offset = 14, step back 10 → 10 (within range)
    const stepBack = screen.getByTitle('Step back 10 candles')
    fireEvent.click(stepBack)
    vi.advanceTimersByTime(200)
    expect(onScrub).toHaveBeenCalledWith(10)
    // Step back again → min(14, 20) = 14
    onScrub.mockClear()
    fireEvent.click(stepBack)
    vi.advanceTimersByTime(200)
    expect(onScrub).toHaveBeenCalledWith(14)
  })

  it('step forward does not go below 0', () => {
    const onScrub = vi.fn()
    render(<ReplayControls {...defaultProps} paused={true} onScrub={onScrub} candleCount={100} />)
    // Initial offset is 0, step forward → max(0, -10) = 0
    const stepForward = screen.getByTitle('Step forward 10 candles')
    fireEvent.click(stepForward)
    vi.advanceTimersByTime(200)
    expect(onScrub).toHaveBeenCalledWith(0)
  })

  it('displays current scrub offset value', () => {
    render(<ReplayControls {...defaultProps} paused={true} candleCount={100} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '30' } })
    expect(screen.getByText('Scrub: 30 candles back')).toBeInTheDocument()
  })

  it('slider has correct min and max attributes', () => {
    render(<ReplayControls {...defaultProps} paused={true} candleCount={100} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '99')
  })

  it('multiple rapid scrub changes only call onScrub once after debounce', () => {
    const onScrub = vi.fn()
    render(<ReplayControls {...defaultProps} paused={true} onScrub={onScrub} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '10' } })
    fireEvent.change(slider, { target: { value: '20' } })
    fireEvent.change(slider, { target: { value: '30' } })
    vi.advanceTimersByTime(200)
    // Should only call with the last value
    expect(onScrub).toHaveBeenCalledTimes(1)
    expect(onScrub).toHaveBeenCalledWith(30)
  })
})
