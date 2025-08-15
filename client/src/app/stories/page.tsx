"use client"

import useSWR from 'swr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function StoriesListPage() {
  const { data, mutate, isLoading } = useSWR('/api/stories', fetcher)

  async function handleDelete(id: string) {
    await fetch(`/api/stories/${id}`, { method: 'DELETE' })
    mutate()
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Истории</h1>
        <Button asChild>
          <Link href="/editor/new">Новая история</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(data ?? []).map((s: any) => (
          <div key={s.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.deckType}</div>
              </div>
              {s.brandColor ? (
                <div className="h-4 w-4 rounded-full" style={{ background: s.brandColor }} />
              ) : null}
            </div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/editor/${s.id}`}>Редактировать</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/stories/${s.id}`}>Детали</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/presentation/${s.id}`}>Презентация</Link>
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


