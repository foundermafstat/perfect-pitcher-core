import { notFound } from "next/navigation"
import Link from "next/link"

import { auth } from "@/auth"
import { prisma } from "@/config/db"
import { Button } from "@/components/ui/button"

export default async function StoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return notFound()

  const story = await prisma.story.findFirst({
    where: { id },
    include: {
      project: true,
      slides: {
        include: { elements: true },
        orderBy: { position: "asc" },
      },
    },
  })

  if (!story) return notFound()

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{story.title}</h1>
          <p className="text-sm text-muted-foreground">{story.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Создано: {story.createdAt.toLocaleString()}</span>
            <span>Обновлено: {story.updatedAt.toLocaleString()}</span>
            {story.deckType ? <span>Тип: {story.deckType}</span> : null}
            {story.locale ? <span>Язык: {story.locale}</span> : null}
          </div>
          {story.brandColor ? (
            <div className="mt-2 h-1 w-28 rounded" style={{ background: story.brandColor as string }} />
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/stories">Назад</Link>
          </Button>
          <Button asChild>
            <Link href={`/presentation/${story.id}`}>Презентация</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/editor/${story.id}`}>Редактировать</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded border p-4 md:col-span-2">
          <div className="mb-2 text-sm font-medium">Слайды ({story.slides.length})</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {story.slides.map((sl) => (
              <div key={sl.id} className="rounded border p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="font-medium">{sl.title}</div>
                  <span className="text-xs text-muted-foreground">{(sl as any).backgroundType ?? "color"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Элементов: {sl.elements.length}
                </div>
                {(sl as any).background ? (
                  <div
                    className="mt-2 h-2 w-16 rounded"
                    style={{ background: (sl as any).background as string }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4">
          <section className="rounded border p-4">
            <div className="text-sm font-medium">Проект</div>
            {story.project ? (
              <div className="mt-1 text-sm">
                <div className="font-medium">{story.project.name}</div>
                <div className="text-muted-foreground">{story.project.shortDescription}</div>
                <Link className="mt-1 inline-block underline" href={`/projects/${story.project.id}`}>
                  Открыть проект
                </Link>
              </div>
            ) : (
              <div className="text-muted-foreground">Не привязано к проекту</div>
            )}
          </section>

          <section className="rounded border p-4">
            <div className="text-sm font-medium">Метаданные</div>
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





