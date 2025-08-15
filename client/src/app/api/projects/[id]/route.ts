import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/config/db"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const p = await prisma.project.findFirst({ where: { id, userId: session.user.id } })
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(p)
}


