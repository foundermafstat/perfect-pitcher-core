"use client"

import { useState, useEffect } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/providers/translations-context"

interface Story {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  deckType: string | null
  locale: string | null
  brandColor: string | null
  slides: Array<{
    id: string
    title: string
    elements: Array<any>
    background?: string
    backgroundType?: string
  }>
  project?: {
    id: string
    name: string
    shortDescription: string | null
  } | null
  finalDataEn?: any
  qaLocalized?: any
}

export default function StoryDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const { t } = useTranslations()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return

    fetch(`/api/stories/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Story not found')
        return res.json()
      })
      .then(data => {
        if (data.success && data.story) {
          setStory(data.story)
        } else {
          throw new Error('Story not found')
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="container mx-auto max-w-5xl p-6">{t('stories.loading')}</div>
  if (error || !story) return notFound()

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{story.title}</h1>
          <p className="text-sm text-muted-foreground">{story.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{t('storyDetails.created')}: {new Date(story.createdAt).toLocaleString()}</span>
            <span>{t('storyDetails.updated')}: {new Date(story.updatedAt).toLocaleString()}</span>
            {story.deckType ? <span>{t('storyDetails.type')}: {story.deckType}</span> : null}
            {story.locale ? <span>{t('storyDetails.language')}: {story.locale}</span> : null}
          </div>
          {story.brandColor ? (
            <div className="mt-2 h-1 w-28 rounded" style={{ background: story.brandColor as string }} />
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/stories">{t('storyDetails.back')}</Link>
          </Button>
          <Button asChild>
            <Link href={`/presentation/${story.id}`}>{t('stories.presentation')}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/stories/${story.id}/edit`}>{t('stories.edit')}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded border p-4 md:col-span-2">
          <div className="mb-2 text-sm font-medium">{t('storyDetails.slides')} ({story.slides?.length || 0})</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {story.slides?.length ? (
              story.slides.map((sl) => (
                <div key={sl.id} className="rounded border p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="font-medium">{sl.title}</div>
                    <span className="text-xs text-muted-foreground">{(sl as any).backgroundType ?? "color"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('storyDetails.elements')}: {sl.elements?.length || 0}
                  </div>
                  {(sl as any).background ? (
                    <div
                      className="mt-2 h-2 w-16 rounded"
                      style={{ background: (sl as any).background as string }}
                    />
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                {t('storyDetails.noSlides') || 'Нет слайдов'}
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-4">
          <section className="rounded border p-4">
            <div className="text-sm font-medium">{t('storyDetails.project')}</div>
            {story.project ? (
              <div className="mt-1 text-sm">
                <div className="font-medium">{story.project.name}</div>
                <div className="text-muted-foreground">{story.project.shortDescription}</div>
                <Link className="mt-1 inline-block underline" href={`/projects/${story.project.id}`}>
                  {t('storyDetails.openProject')}
                </Link>
              </div>
            ) : (
              <div className="text-muted-foreground">{t('storyDetails.noProject')}</div>
            )}
          </section>

          <section className="rounded border p-4">
            <div className="text-sm font-medium">{t('storyDetails.metadata')}</div>
            <div className="mt-2 space-y-1 text-sm">
              {story.finalDataEn ? (
                <details>
                  <summary className="cursor-pointer select-none">finalDataEn</summary>
                  <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(story.finalDataEn, null, 2)}</pre>
                </details>
              ) : null}
              {story.qaLocalized ? (
                <details>
                  <summary className="cursor-pointer select-none">qaLocalized</summary>
                  <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(story.qaLocalized, null, 2)}</pre>
                </details>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}





