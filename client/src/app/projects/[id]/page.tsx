import { notFound } from "next/navigation"
import Link from "next/link"

import { auth } from "@/auth"
import { prisma } from "@/config/db"
import { Button } from "@/components/ui/button"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return notFound()
  const p = await prisma.project.findFirst({ where: { id, userId: session.user.id } })
  if (!p) return notFound()

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <Link className="underline" href="/projects">
          Назад к списку
        </Link>
      </div>

      <div className="grid gap-4">
        {p.logoBase64 ? (
          <section className="rounded border p-4">
            <div className="text-sm font-medium">Логотип</div>
            <img
              alt="project logo"
              className="mt-2 h-24 w-24 rounded border bg-white object-contain"
              src={`data:${p.logoMimeType ?? 'image/png'};base64,${p.logoBase64}`}
            />
          </section>
        ) : null}
        <section className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Короткое описание</div>
          <div>{p.shortDescription}</div>
        </section>

        <section className="rounded border p-4">
          <div className="text-sm font-medium">Проблема</div>
          <div className="whitespace-pre-wrap">{p.problemStatement}</div>
        </section>

        <section className="rounded border p-4">
          <div className="text-sm font-medium">Подход к решению</div>
          {typeof p.solutionApproach === 'string' ? (
            <div className="whitespace-pre-wrap">{p.solutionApproach as unknown as string}</div>
          ) : (
            <pre className="overflow-auto rounded bg-muted p-3 text-sm">{JSON.stringify(p.solutionApproach, null, 2)}</pre>
          )}
        </section>

        <section className="rounded border p-4">
          <div className="text-sm font-medium">Технический дизайн</div>
          <pre className="overflow-auto rounded bg-muted p-3 text-sm">{JSON.stringify(p.technicalDesign, null, 2)}</pre>
        </section>

        <section className="rounded border p-4">
          <div className="text-sm font-medium">Контекст ИИ-агента</div>
          <pre className="whitespace-pre-wrap">{p.agentContext}</pre>
        </section>

        <div className="flex gap-3">
          <Link className="underline" href={`/projects/${p.id}/edit`}>
            Редактировать
          </Link>
          <form
            action={async () => {
              'use server'
              const session = await auth()
              if (!session?.user?.id) return
              const { deleteProject } = await import("@/server-actions/projects")
              await deleteProject({ id: p.id })
              // server redirect is tricky из server action без доступа к router — просто пусть клиент вернётся назад
            }}
          >
            <Button type="submit" variant="destructive">Удалить</Button>
          </form>
        </div>
      </div>
    </div>
  )
}


