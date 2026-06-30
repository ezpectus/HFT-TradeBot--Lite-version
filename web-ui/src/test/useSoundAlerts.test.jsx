/**
 * Tests for useSoundAlerts hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSoundAlerts } from '../hooks/useSoundAlerts'

// Mock AudioContext
class MockAudioContext {
  constructor() {
    this.state = 'running'
    this.currentTime = 0
    this.destination = { _isDestination: true }
  }
  resume() { this.state = 'running' }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }
  }
}

describe('useSoundAlerts', () => {
  let audioCtxMock

  beforeEach(() => {
    audioCtxMock = new MockAudioContext()
    vi.stubGlobal('AudioContext', vi.fn(() => audioCtxMock))
    vi.stubGlobal('webkitAudioContext', vi.fn(() => audioCtxMock))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns play and setEnabled functions', () => {
    const { result } = renderHook(() => useSoundAlerts())
    expect(typeof result.current.play).toBe('function')
    expect(typeof result.current.setEnabled).toBe('function')
  })

  it('play does not throw for valid sound types', () => {
    const { result } = renderHook(() => useSoundAlerts())
    const types = ['fill', 'sl', 'tp', 'alert', 'connect', 'disconnect']
    for (const type of types) {
      expect(() => act(() => result.current.play(type))).not.toThrow()
    }
  })

  it('play does nothing for invalid sound type', () => {
    const { result } = renderHook(() => useSoundAlerts())
    expect(() => act(() => result.current.play('invalid'))).not.toThrow()
  })

  it('play does nothing when disabled', () => {
    const { result } = renderHook(() => useSoundAlerts(false))
    act(() => result.current.play('fill'))
    // AudioContext should not be created when disabled
    expect(AudioContext).not.toHaveBeenCalled()
  })

  it('setEnabled toggles sound playback', () => {
    const { result } = renderHook(() => useSoundAlerts(false))
    // Disabled — play should do nothing
    act(() => result.current.play('fill'))
    expect(AudioContext).not.toHaveBeenCalled()

    // Enable
    act(() => result.current.setEnabled(true))
    act(() => result.current.play('fill'))
    expect(AudioContext).toHaveBeenCalled()
  })

  it('creates AudioContext lazily on first play', () => {
    const { result } = renderHook(() => useSoundAlerts())
    expect(AudioContext).not.toHaveBeenCalled()

    act(() => result.current.play('fill'))
    expect(AudioContext).toHaveBeenCalledTimes(1)
  })

  it('reuses AudioContext on subsequent plays', () => {
    const { result } = renderHook(() => useSoundAlerts())
    act(() => result.current.play('fill'))
    act(() => result.current.play('sl'))
    act(() => result.current.play('tp'))
    expect(AudioContext).toHaveBeenCalledTimes(1)
  })

  it('creates oscillator and gain nodes on play', () => {
    const { result } = renderHook(() => useSoundAlerts())
    const createOscSpy = vi.spyOn(audioCtxMock, 'createOscillator')
    const createGainSpy = vi.spyOn(audioCtxMock, 'createGain')

    act(() => result.current.play('fill'))

    expect(createOscSpy).toHaveBeenCalledTimes(1)
    expect(createGainSpy).toHaveBeenCalledTimes(1)
  })

  it('sets oscillator type and frequency from config', () => {
    const { result } = renderHook(() => useSoundAlerts())
    const createOscSpy = vi.spyOn(audioCtxMock, 'createOscillator')

    act(() => result.current.play('sl'))

    const osc = createOscSpy.mock.results[0].value
    expect(osc.type).toBe('sawtooth')
    expect(osc.frequency.value).toBe(300)
  })

  it('resumes suspended AudioContext', () => {
    audioCtxMock.state = 'suspended'
    const resumeSpy = vi.spyOn(audioCtxMock, 'resume')
    const { result } = renderHook(() => useSoundAlerts())

    act(() => result.current.play('fill'))
    expect(resumeSpy).toHaveBeenCalled()
  })
})
