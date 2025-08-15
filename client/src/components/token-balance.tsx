"use client"

import { useAccount, useReadContract } from "wagmi"
import { erc20Abi } from "viem"
import { coreTestnet2 } from "@/lib/wagmi"

export function TokenBalance({ tokenAddress, label }: { tokenAddress: `0x${string}`; label?: string }) {
  const { address, isConnected } = useAccount()

  const { data: decimals } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "decimals",
    chainId: coreTestnet2.id,
    query: { enabled: isConnected },
  }) as { data: number | undefined }

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "symbol",
    chainId: coreTestnet2.id,
    query: { enabled: isConnected },
  }) as { data: string | undefined }

  const { data: rawBalance, isLoading } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: coreTestnet2.id,
    query: { enabled: isConnected && !!address },
  }) as { data: bigint | undefined; isLoading: boolean }

  if (!isConnected) return null
  if (!rawBalance || decimals == null) return (
    <div className="text-sm text-muted-foreground">{label ?? "Token"}: {isLoading ? "…" : "0"}</div>
  )

  const formatted = Number(rawBalance) / 10 ** Number(decimals)
  return (
    <div className="text-sm">
      {label ?? symbol ?? "Token"}: {formatted}
    </div>
  )
}













