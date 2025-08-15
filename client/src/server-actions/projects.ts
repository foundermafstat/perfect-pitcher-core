"use server"

import { auth } from "@/auth"
import { prisma } from "@/config/db"
import { createProjectSchema } from "@/validations/project"

export async function saveProject(params: {
  name: string
  shortDescription: string
  problemStatement: string
  solutionApproach: unknown
  technicalDesign: Record<string, unknown>
  agentContext: string
  logoBase64?: string
  logoMimeType?: string
  logoPrompt?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const base = { name: params.name, shortDescription: params.shortDescription }
  const parsed = createProjectSchema.safeParse(base)
  if (!parsed.success) throw new Error("Validation error")

  const created = await prisma.project.create({
    data: {
      name: params.name,
      shortDescription: params.shortDescription,
      userId: session.user.id,
      problemStatement: params.problemStatement,
      solutionApproach: params.solutionApproach,
      technicalDesign: params.technicalDesign as any,
      agentContext: params.agentContext,
      logoBase64: params.logoBase64 ?? null,
      logoMimeType: params.logoMimeType ?? null,
      logoPrompt: params.logoPrompt ?? null,
    },
  })
  return created
}

export async function generateProjectLogo(params: { projectId: string; prompt: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const project = await prisma.project.findFirst({ where: { id: params.projectId, userId: session.user.id } })
  if (!project) throw new Error("Project not found")

  if (!process.env.OPENAI_API_KEY) {
    // dev fallback
    const base64 = ""
    await prisma.project.update({ where: { id: project.id }, data: { logoBase64: base64, logoMimeType: "image/png", logoPrompt: params.prompt } })
    return { base64, mimeType: "image/png" }
  }

  const prompt = `Минималистичный логотип для проекта: ${project.name}. Идея: ${params.prompt}. ОБЯЗАТЕЛЬНО: белый цвет элементов, прозрачный фон, чистый векторный стиль, без текста, высокий контраст, плоский дизайн, SVG-подобная графика.`
  // primary endpoint (gpt-image-1): /v1/images
  let resp = await fetch("https://api.openai.com/v1/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "low",
      background: "transparent",
      output_format: "png",
      response_format: "b64_json",
      n: 1,
    }),
  })
  // fallback for environments where /v1/images not routed: use legacy /v1/images/generations
  if (resp.status === 404) {
    resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        quality: "low",
        background: "transparent",
        output_format: "png",
        response_format: "b64_json",
        n: 1,
      }),
    })
  }
  if (!resp.ok) throw new Error(await resp.text())
  const data = await resp.json()
  const base64 = data.data?.[0]?.b64_json
  if (!base64) throw new Error("No image returned")
  await prisma.project.update({ where: { id: project.id }, data: { logoBase64: base64, logoMimeType: "image/png", logoPrompt: params.prompt } })
  return { base64, mimeType: "image/png" }
}

export async function generateLogoPreview(params: { prompt: string; name?: string; shortDescription?: string; size?: "256x256" | "512x512" | "1024x1024" }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY не задан")
    throw new Error("OPENAI_API_KEY не задан. Добавьте API ключ OpenAI в переменные окружения.")
  }

  const fullPrompt = `Минималистичный логотип для проекта${params.name ? ` ${params.name}` : ""}. ${params.shortDescription ? `Описание: ${params.shortDescription}.` : ""} ${params.prompt}. ОБЯЗАТЕЛЬНО: белый цвет элементов, прозрачный фон, чистый векторный стиль, без текста, высокий контраст, плоский дизайн, SVG-подобная графика`.trim()
  
  console.log('Генерация логотипа:', { prompt: fullPrompt, size: params.size ?? "256x256" })

  // Сначала пробуем с новыми параметрами
  let resp = await fetch("https://api.openai.com/v1/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: fullPrompt,
      size: params.size ?? "256x256",
      quality: "low",
      background: "transparent",
      output_format: "png",
      response_format: "b64_json",
      n: 1,
    }),
  })

  // Если не работает, пробуем без новых параметров
  if (!resp.ok) {
    console.log('Первый запрос не удался, пробуем без background/output_format:', resp.status, await resp.text())
    resp = await fetch("https://api.openai.com/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: fullPrompt,
        size: params.size ?? "256x256",
        quality: "low",
        response_format: "b64_json",
        n: 1,
      }),
    })
  }

  // Fallback к старому API
  if (resp.status === 404) {
    console.log('Пробуем старый API /v1/images/generations')
    resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: fullPrompt,
        size: params.size === "256x256" ? "256x256" : "512x512",
        response_format: "b64_json",
        n: 1,
      }),
    })
  }

  if (!resp.ok) {
    const errorText = await resp.text()
    console.error('Ошибка API OpenAI:', resp.status, errorText)
    throw new Error(`OpenAI API Error (${resp.status}): ${errorText}`)
  }

  const data = await resp.json()
  console.log('Ответ от OpenAI:', data)
  
  const base64 = data.data?.[0]?.b64_json
  if (!base64) {
    console.error('Нет base64 в ответе:', data)
    throw new Error("Логотип не был сгенерирован. Проверьте ответ API.")
  }
  
  console.log('Логотип успешно сгенерирован')
  return { base64, mimeType: "image/png" }
}

export async function updateProject(params: {
  id: string
  name?: string
  shortDescription?: string
  problemStatement?: string
  solutionApproach?: unknown
  technicalDesign?: Record<string, unknown>
  agentContext?: string
  logoBase64?: string | null
  logoMimeType?: string | null
  logoPrompt?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!project) throw new Error("Project not found")
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: {
      name: params.name ?? project.name,
      shortDescription: params.shortDescription ?? project.shortDescription,
      problemStatement: params.problemStatement ?? project.problemStatement,
      solutionApproach: params.solutionApproach ?? project.solutionApproach,
      technicalDesign: (params.technicalDesign as any) ?? project.technicalDesign,
      agentContext: params.agentContext ?? project.agentContext,
      logoBase64: params.logoBase64 ?? project.logoBase64,
      logoMimeType: params.logoMimeType ?? project.logoMimeType,
      logoPrompt: params.logoPrompt ?? project.logoPrompt,
    },
  })
  return updated
}

export async function deleteProject(params: { id: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!project) throw new Error("Project not found")
  await prisma.project.delete({ where: { id: project.id } })
  return { success: true }
}


