import { useState, useEffect, useCallback } from 'react'

/**
 * Persist state to localStorage with automatic JSON serialization.
 * @param {string} key - localStorage key
 * @param {*} initialValue - initial value if nothing is stored
 * @returns {[value, setValue]} Stateful value and setter
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore quota / serialization errors
    }
  }, [key, value])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setValue, remove]
}
