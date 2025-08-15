import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/config/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })
  const stories = await prisma.story.findMany({
    where: { projectId: null },
    orderBy: { updatedAt: 'desc' },
    include: { slides: { include: { elements: true } } },
  })
  return NextResponse.json(stories)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body?.title) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  const created = await prisma.story.create({ data: body })
  return NextResponse.json(created, { status: 201 })
}