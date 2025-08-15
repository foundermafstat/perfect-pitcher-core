import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { verifyOnchainMint } from "@/lib/web3/verify-mint"

// POST /api/tokens/mint { txHash: string }
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { txHash } = await req.json()
    if (!txHash || typeof txHash !== "string") {
      return NextResponse.json({ error: "Invalid txHash" }, { status: 400 })
    }

    const user = (await prisma.user.findUnique({ where: { email: session.user.email } })) as any
    if (!user?.walletAddress) {
      return NextResponse.json({ error: "Wallet not linked" }, { status: 400 })
    }

    // Проверяем ончейн-транзакцию: контракт, событие, получатель, количество токенов
    const result = await verifyOnchainMint({ txHash, userWallet: user.walletAddress })
    if (!result.valid) {
      return NextResponse.json({ error: result.error || "Invalid transaction" }, { status: 400 })
    }

    // Начисляем токены один раз на txHash (идемпотентность)
    const exists = await (prisma as any).tokenTransaction.findFirst({ where: { reason: txHash } })
    if (exists) {
      return NextResponse.json({ success: true, credited: 0, duplicate: true })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { tokenBalance: { increment: result.amount } } as any,
      }),
      (prisma as any).tokenTransaction.create({
        data: {
          userId: user.id,
          amount: result.amount,
          type: "CREDIT",
          reason: txHash, // сохраняем txHash как reason для идемпотентности
          meta: { txHash, contract: result.contract, chainId: result.chainId },
        },
      }),
    ])

    return NextResponse.json({ success: true, credited: result.amount })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}


