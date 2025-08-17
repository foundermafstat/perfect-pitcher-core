"use client"

import { useEffect, useState } from 'react'
import type { Story } from '@/lib/types'

export function useStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/stories', { method: 'GET' })
        if (!res.ok) throw new Error(`Failed to load stories: ${res.status}`)
        const fetchedStories = (await res.json()) as Story[]
        setStories(Array.isArray(fetchedStories) ? fetchedStories : [])
      } catch (err) {
        console.error('Error fetching stories:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки историй')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStories()
  }, [])

  return { stories, isLoading, error }
}

