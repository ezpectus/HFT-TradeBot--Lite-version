/**
 * Tests for useKeyboardShortcuts hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

function dispatchKey(key, options = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
  Object.defineProperty(event, 'target', {
    value: options.target || document.body,
    writable: false,
  })
  window.dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  let handlers

  beforeEach(() => {
    handlers = {
      'a': vi.fn(),
      '1': vi.fn(),
      ' ': vi.fn(),
      'Escape': vi.fn(),
      'ctrl+s': vi.fn(),
      'shift+1': vi.fn(),
      'alt+1': vi.fn(),
      'ctrl+shift+k': vi.fn(),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls handler for simple key', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('a')
    expect(handlers['a']).toHaveBeenCalledTimes(1)
  })

  it('calls handler for digit key', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('1')
    expect(handlers['1']).toHaveBeenCalledTimes(1)
  })

  it('calls handler for space key', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey(' ')
    expect(handlers[' ']).toHaveBeenCalledTimes(1)
  })

  it('calls handler for Escape key', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('Escape')
    expect(handlers['Escape']).toHaveBeenCalledTimes(1)
  })

  it('calls handler for ctrl+s combo', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('s', { ctrlKey: true })
    expect(handlers['ctrl+s']).toHaveBeenCalledTimes(1)
  })

  it('calls handler for shift+1 combo', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('1', { shiftKey: true })
    expect(handlers['shift+1']).toHaveBeenCalledTimes(1)
    expect(handlers['1']).not.toHaveBeenCalled()
  })

  it('calls handler for alt+1 combo', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('1', { altKey: true })
    expect(handlers['alt+1']).toHaveBeenCalledTimes(1)
  })

  it('calls handler for ctrl+shift+k triple combo', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('k', { ctrlKey: true, shiftKey: true })
    expect(handlers['ctrl+shift+k']).toHaveBeenCalledTimes(1)
  })

  it('supports metaKey as ctrl equivalent', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('s', { metaKey: true })
    expect(handlers['ctrl+s']).toHaveBeenCalledTimes(1)
  })

  it('does not call handler when key not registered', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    dispatchKey('z')
    expect(handlers['a']).not.toHaveBeenCalled()
  })

  it('ignores shortcuts when typing in input (default)', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    const input = document.createElement('input')
    dispatchKey('a', { target: input })
    expect(handlers['a']).not.toHaveBeenCalled()
  })

  it('ignores shortcuts when typing in textarea (default)', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    const textarea = document.createElement('textarea')
    dispatchKey('a', { target: textarea })
    expect(handlers['a']).not.toHaveBeenCalled()
  })

  it('ignores shortcuts when typing in select (default)', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    const select = document.createElement('select')
    dispatchKey('a', { target: select })
    expect(handlers['a']).not.toHaveBeenCalled()
  })

  it('allows shortcuts in inputs when ignoreInputs is false', () => {
    renderHook(() => useKeyboardShortcuts(handlers, { ignoreInputs: false }))

    const input = document.createElement('input')
    dispatchKey('a', { target: input })
    expect(handlers['a']).toHaveBeenCalledTimes(1)
  })

  it('calls preventDefault on matched shortcut', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    const event = dispatchKey('a')
    expect(event.defaultPrevented).toBe(true)
  })

  it('does not call preventDefault on unmatched key', () => {
    renderHook(() => useKeyboardShortcuts(handlers))

    const event = dispatchKey('z')
    expect(event.defaultPrevented).toBe(false)
  })

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts(handlers))

    unmount()
    dispatchKey('a')
    expect(handlers['a']).not.toHaveBeenCalled()
  })

  it('is case-insensitive for key matching', () => {
    renderHook(() => useKeyboardShortcuts({ 'a': handlers['a'] }))

    dispatchKey('A')
    expect(handlers['a']).toHaveBeenCalledTimes(1)
  })
})
