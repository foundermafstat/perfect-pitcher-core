import Link from "next/link"
import { Suspense } from "react"

import { auth } from "@/auth"
import { prisma } from "@/config/db"

async function ProjectsList() {
  const session = await auth()
  if (!session?.user?.id) {
    return (
      <div className="text-sm text-muted-foreground">
        Войдите, чтобы увидеть свои проекты.
      </div>
    )
  }
  const items = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  if (!items.length) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Пока пусто.</div>
        <Link className="underline" href="/projects/new">
          Создать проект →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {items.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}`}
          className="rounded border p-4 hover:bg-muted"
        >
          <div className="text-base font-medium">{p.name}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            {p.shortDescription}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои проекты</h1>
        <Link className="underline" href="/projects/new">
          Новый проект
        </Link>
      </div>
      <Suspense>
        {/* @ts-expect-error Server Component */}
        <ProjectsList />
      </Suspense>
    </div>
  )
}


