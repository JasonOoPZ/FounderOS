import { useState, useCallback } from 'react'

/**
 * Hook to safely fetch logos from the backend endpoint
 * Prevents exposing API tokens in client code
 */
export function useLogo() {
  const [cache] = useState<Record<string, string>>({})

  const getLogoUrl = useCallback((domain: string, size = 40): string => {
    if (cache[domain]) return cache[domain]
    // Return the API endpoint URL that will proxy to logo.dev
    return `/api/logo?domain=${encodeURIComponent(domain)}&size=${size}`
  }, [cache])

  return { getLogoUrl }
}
