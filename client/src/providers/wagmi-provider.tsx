"use client"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { wagmiConfig, coreTestnet2 } from "@/lib/wagmi"
import { ReactNode, useMemo } from "react"

export function WagmiClientProvider({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), [])
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={coreTestnet2}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
