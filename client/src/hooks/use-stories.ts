"use client"

import { useEffect, useState } from 'react'
import { getStories } from '@/actions/slide'

export interface Story {
  id: string
  title: string
  description?: string
  slides?: Array<{
    id: string
    title: string
    content: string
  }>
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true)
        const fetchedStories = await getStories()
        setStories(fetchedStories || [])
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

