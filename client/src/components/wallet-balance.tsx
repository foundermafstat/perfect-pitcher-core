"use client"

import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowUpDown, RefreshCw } from "lucide-react"
import { usePerfectPitcherToken } from "@/hooks/use-perfect-pitcher-token"
import { coreTestnet2 } from "@/lib/wagmi"
import Link from "next/link"

export function WalletBalance() {
  const { isConnected, chain } = useAccount()
  const { balances } = usePerfectPitcherToken()

  const isCorrectNetwork = chain?.id === coreTestnet2.id

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center">
          <Wallet className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Connect your wallet to view balances
          </p>
          <ConnectButton />
        </CardContent>
      </Card>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <Card className="w-full border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="p-4 text-center">
          <Badge variant="destructive" className="mb-2">
            Wrong Network
          </Badge>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Please switch to Core Testnet 2
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet Balance
          </h3>
          <Badge variant="outline" className="text-xs">
            {chain?.name}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* tCORE Balance */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">tCORE</div>
              <div className="text-xs text-muted-foreground">Native Token</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">
                {balances?.core?.formatted ? 
                  parseFloat(balances.core.formatted).toFixed(4) : 
                  "0.0000"
                }
              </div>
            </div>
          </div>

          {/* PRFCT Balance */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">PRFCT</div>
              <div className="text-xs text-muted-foreground">Platform Token</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">
                {balances?.prfct?.formatted ? 
                  parseFloat(balances.prfct.formatted).toFixed(2) : 
                  "0.00"
                }
              </div>
            </div>
          </div>

          {/* Spending Allowance */}
          {balances?.spendingAllowance && parseFloat(balances.spendingAllowance.formatted) > 0 && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-medium">Spending Allowance</div>
                  <div className="text-xs text-muted-foreground">Available for AI services</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs">
                    {parseFloat(balances.spendingAllowance.formatted).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <div className="pt-3 border-t">
            <Link href="/token-swap" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowUpDown className="w-3 h-3 mr-2" />
                Swap Tokens
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
