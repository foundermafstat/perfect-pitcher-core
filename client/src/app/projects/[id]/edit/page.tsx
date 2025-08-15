import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/config/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return notFound()
  const p = await prisma.project.findFirst({ where: { id, userId: session.user.id } })
  if (!p) return notFound()

  async function update(formData: FormData) {
    'use server'
    const session = await auth()
    if (!session?.user?.id) return notFound()
    const { updateProject } = await import("@/server-actions/projects")
    await updateProject({
      id,
      name: String(formData.get('name') || p.name),
      shortDescription: String(formData.get('shortDescription') || p.shortDescription),
      problemStatement: String(formData.get('problemStatement') || p.problemStatement),
      solutionApproach: (() => {
        const s = String(formData.get('solutionApproach') || '')
        try { const obj = JSON.parse(s); if (obj && typeof obj === 'object') return obj } catch {}
        return s
      })(),
      technicalDesign: (() => {
        const s = String(formData.get('technicalDesign') || '{}')
        try { const obj = JSON.parse(s); if (obj && typeof obj === 'object') return obj } catch {}
        return p.technicalDesign as any
      })(),
      agentContext: String(formData.get('agentContext') || p.agentContext),
    })
    redirect(`/projects/${id}`)
  }

  async function genLogo(formData: FormData) {
    'use server'
    const session = await auth()
    if (!session?.user?.id) return notFound()
    const { generateProjectLogo } = await import("@/server-actions/projects")
    await generateProjectLogo({ projectId: id, prompt: String(formData.get('logoPrompt') || 'минималистичный символ') })
    redirect(`/projects/${id}/edit`)
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Редактирование проекта</h1>

      <form action={update} className="grid gap-4">
        <label className="grid gap-2">
          <div>Название</div>
          <Input name="name" defaultValue={p.name} />
        </label>
        <label className="grid gap-2">
          <div>Короткое описание</div>
          <Textarea name="shortDescription" defaultValue={p.shortDescription} rows={3} />
        </label>
        <label className="grid gap-2">
          <div>Проблема</div>
          <Textarea name="problemStatement" defaultValue={p.problemStatement} rows={4} />
        </label>
        <label className="grid gap-2">
          <div>Подход к решению (строка или JSON)</div>
          <Textarea name="solutionApproach" defaultValue={typeof p.solutionApproach === 'string' ? (p.solutionApproach as any) : JSON.stringify(p.solutionApproach, null, 2)} rows={6} />
        </label>
        <label className="grid gap-2">
          <div>Технический дизайн (JSON)</div>
          <Textarea name="technicalDesign" defaultValue={JSON.stringify(p.technicalDesign, null, 2)} rows={6} />
        </label>
        <label className="grid gap-2">
          <div>Контекст ИИ-агента</div>
          <Textarea name="agentContext" defaultValue={p.agentContext} rows={4} />
        </label>
        <div className="flex gap-2">
          <Button type="submit">Сохранить</Button>
        </div>
      </form>

      <form action={genLogo} className="grid gap-2 rounded border p-4">
        <div className="text-sm font-medium">Генерация логотипа</div>
        {p.logoBase64 ? (
          <img alt="logo" className="mt-2 h-24 w-24 rounded border bg-white object-contain" src={`data:${p.logoMimeType ?? 'image/png'};base64,${p.logoBase64}`} />
        ) : null}
        <Input name="logoPrompt" placeholder="Идея/стиль логотипа" />
        <div>
          <Button type="submit" variant="secondary">Сгенерировать новый логотип</Button>
        </div>
      </form>
    </div>
  )
}


