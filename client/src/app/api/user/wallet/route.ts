import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { address } = await req.json()
    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: { walletAddress: address.toLowerCase() },
      select: { id: true, walletAddress: true },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}



