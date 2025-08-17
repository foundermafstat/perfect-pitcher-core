"use client"

import { ReactNode } from "react"
import { WagmiClientProvider } from "@/providers/wagmi-provider"

export function WalletProviders({ children }: { children: ReactNode }) {
  return <WagmiClientProvider>{children}</WagmiClientProvider>
}
