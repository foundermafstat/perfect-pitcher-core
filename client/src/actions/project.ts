"use server"

import { prisma } from "@/config/db"
import { auth } from "@/auth"
import { createProjectSchema, type CreateProjectInput } from "@/validations/project"

export async function listMyProjects() {
  const session = await auth()
  if (!session?.user?.id) return []
  return prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProjectById(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.project.findFirst({ where: { id, userId: session.user.id } })
}

export type GeneratedProjectDetails = {
  problemStatement: string
  solutionApproach: string
  technicalDesign: Record<string, unknown>
  agentContext: string
}

export async function createProject(input: CreateProjectInput & { generated: GeneratedProjectDetails }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = createProjectSchema.safeParse(input)
  if (!parsed.success) throw new Error("Validation error")

  const { name, shortDescription, generated } = input

  return prisma.project.create({
    data: {
      name,
      shortDescription,
      userId: session.user.id,
      problemStatement: generated.problemStatement,
      solutionApproach: generated.solutionApproach,
      technicalDesign: generated.technicalDesign as any,
      agentContext: generated.agentContext,
    },
  })
}

export async function attachStoryToProject(params: { projectId: string; storyId: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const { projectId, storyId } = params
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: session.user.id } })
  if (!project) throw new Error("Project not found")
  await prisma.story.update({ where: { id: storyId }, data: { projectId: projectId } })
  return { success: true }
}

export async function saveProjectLogo(params: { projectId: string; base64: string; mimeType: string; prompt?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const { projectId, base64, mimeType, prompt } = params
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: session.user.id } })
  if (!project) throw new Error("Project not found")
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { logoBase64: base64, logoMimeType: mimeType, logoPrompt: prompt ?? null },
  })
  return updated
}

