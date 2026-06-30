import { useState, useEffect, useRef } from 'react'

/**
 * useAnimatedNumber — animates a number from its previous value to the new value.
 * Uses requestAnimationFrame for smooth 60fps transitions.
 *
 * @param {number} value - The target value to animate to
 * @param {number} duration - Animation duration in ms (default: 300)
 * @returns {number} - The currently displayed (animated) value
 *
 * Usage:
 *   const animatedBalance = useAnimatedNumber(balance)
 *   <span>${animatedBalance.toFixed(2)}</span>
 */
export function useAnimatedNumber(value, duration = 300) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  const rafRef = useRef(null)
  const startTimeRef = useRef(0)

  useEffect(() => {
    const prevValue = prevValueRef.current
    if (value === prevValue) return

    startTimeRef.current = performance.now()
    const animate = (now) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(1, elapsed / duration)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = prevValue + (value - prevValue) * eased
      setDisplayValue(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevValueRef.current = value
        setDisplayValue(value)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return displayValue
}
