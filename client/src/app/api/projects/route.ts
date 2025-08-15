import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { prisma } from "@/config/db"

const createSchema = z.object({
  name: z.string().min(2),
  shortDescription: z.string().min(10),
  generated: z.object({
    problemStatement: z.string().min(5),
    solutionApproach: z.any(),
    technicalDesign: z.record(z.any()),
    agentContext: z.string().min(5),
  }),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })
  const items = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  const { name, shortDescription, generated } = parsed.data
  const created = await prisma.project.create({
    data: {
      name,
      shortDescription,
      userId: session.user.id,
      problemStatement: generated.problemStatement,
      solutionApproach: generated.solutionApproach as any,
      technicalDesign: generated.technicalDesign as any,
      agentContext: generated.agentContext,
    },
  })
  return NextResponse.json(created, { status: 201 })
}


