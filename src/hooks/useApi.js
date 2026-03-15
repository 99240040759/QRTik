import { useState } from 'react'
import { apiBase } from '../config'

export function useApi(token) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function request(path, options) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...options
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Request failed')
      }
      return data
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { request, loading, error }
}
