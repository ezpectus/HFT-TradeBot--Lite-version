/**
 * Tests for useDebounce hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('returns initial value when no delay specified (default 300ms)', () => {
    const { result } = renderHook(() => useDebounce('test'))
    expect(result.current).toBe('test')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    })

    expect(result.current).toBe('initial')

    rerender({ value: 'changed' })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('changed')
  })

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(200))

    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('c')
  })

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 0 },
    })

    rerender({ value: 42 })
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe(42)
  })

  it('works with object values', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: { name: 'a' } },
    })

    rerender({ value: { name: 'b' } })
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toEqual({ name: 'b' })
  })

  it('works with null and undefined', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: null },
    })

    expect(result.current).toBeNull()

    rerender({ value: undefined })
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBeUndefined()
  })

  it('cleans up timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'changed' })
    unmount()

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('initial')
  })

  it('handles delay change', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    })

    rerender({ value: 'b', delay: 100 })
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('b')
  })
})
