/**
 * Tests for useLocalStorage hook
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('returns stored value from localStorage', () => {
    localStorage.setItem('my-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('my-key', 'default'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('persists value to localStorage on change', () => {
    const { result } = renderHook(() => useLocalStorage('persist-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(localStorage.getItem('persist-key'))).toBe('updated')
  })

  it('handles object values with JSON serialization', () => {
    const initial = { name: 'test', count: 0 }
    const { result } = renderHook(() => useLocalStorage('obj-key', initial))

    act(() => {
      result.current[1]({ name: 'updated', count: 5 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', count: 5 })
    expect(JSON.parse(localStorage.getItem('obj-key'))).toEqual({ name: 'updated', count: 5 })
  })

  it('handles array values', () => {
    const { result } = renderHook(() => useLocalStorage('arr-key', []))

    act(() => {
      result.current[1]([1, 2, 3])
    })

    expect(result.current[0]).toEqual([1, 2, 3])
    expect(JSON.parse(localStorage.getItem('arr-key'))).toEqual([1, 2, 3])
  })

  it('handles numeric values', () => {
    const { result } = renderHook(() => useLocalStorage('num-key', 0))

    act(() => {
      result.current[1](42)
    })

    expect(result.current[0]).toBe(42)
    expect(JSON.parse(localStorage.getItem('num-key'))).toBe(42)
  })

  it('handles boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false))

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0]).toBe(true)
    expect(JSON.parse(localStorage.getItem('bool-key'))).toBe(true)
  })

  it('remove() clears localStorage and resets to initial', () => {
    const { result } = renderHook(() => useLocalStorage('rm-key', 'initial'))

    act(() => {
      result.current[1]('changed')
    })
    expect(localStorage.getItem('rm-key')).not.toBeNull()

    act(() => {
      result.current[2]()
    })

    expect(result.current[0]).toBe('initial')
    expect(localStorage.getItem('rm-key')).toBeNull()
  })

  it('falls back to initial value on corrupted localStorage data', () => {
    localStorage.setItem('corrupt-key', '{invalid json}')
    const { result } = renderHook(() => useLocalStorage('corrupt-key', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('handles null initial value', () => {
    const { result } = renderHook(() => useLocalStorage('null-key', null))
    expect(result.current[0]).toBeNull()
  })

  it('handles function updater', () => {
    const { result } = renderHook(() => useLocalStorage('fn-key', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })
    expect(result.current[0]).toBe(1)

    act(() => {
      result.current[1]((prev) => prev + 10)
    })
    expect(result.current[0]).toBe(11)
  })

  it('persists across hook remounts', () => {
    const { result, unmount } = renderHook(() => useLocalStorage('remount-key', 'initial'))

    act(() => {
      result.current[1]('persisted')
    })
    unmount()

    const { result: result2 } = renderHook(() => useLocalStorage('remount-key', 'initial'))
    expect(result2.current[0]).toBe('persisted')
  })
})
