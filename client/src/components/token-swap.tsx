"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { formatUnits, parseUnits } from "viem"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowUpDown, Wallet, ExternalLink, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePerfectPitcherToken } from "@/hooks/use-perfect-pitcher-token"
import { coreTestnet2 } from "@/lib/wagmi"

export function TokenSwap() {
  const { isConnected, chain } = useAccount()
  const [coreAmount, setCoreAmount] = useState("")
  const [slippage, setSlippage] = useState("5")
  const [isCalculating, setIsCalculating] = useState(false)

  const {
    balances,
    prices,
    isApproving,
    isSwapping,
    approveCORE,
    swapCOREToPRFCT,
    calculateExpectedPRFCT,
    needsApproval,
    approveHash,
    swapHash,
  } = usePerfectPitcherToken()

  // Автоматический расчет ожидаемого количества PRFCT
  const expectedPRFCT = calculateExpectedPRFCT(coreAmount)

  // Проверка правильной сети
  const isCorrectNetwork = chain?.id === coreTestnet2.id
  const needsApprovalAmount = coreAmount && needsApproval(coreAmount)

  const handleApprove = async () => {
    try {
      await approveCORE(coreAmount)
    } catch (error) {
      console.error("Approve failed:", error)
    }
  }

  const handleSwap = async () => {
    try {
      await swapCOREToPRFCT(coreAmount, parseFloat(slippage))
    } catch (error: any) {
      console.error("Swap failed:", error)
      // Здесь можно добавить toast уведомление
      if (error?.message) {
        // toast.error(error.message)
      }
    }
  }

  const setMaxCoreAmount = () => {
    if (balances?.core?.formatted) {
      // Оставляем немного для gas fees
      const maxAmount = Math.max(0, parseFloat(balances.core.formatted) - 0.001)
      setCoreAmount(maxAmount.toString())
    }
  }

  const canSwap = isConnected && 
                 isCorrectNetwork && 
                 coreAmount && 
                 parseFloat(coreAmount) > 0 && 
                 balances?.core &&
                 parseFloat(coreAmount) <= parseFloat(balances.core.formatted) &&
                 !needsApprovalAmount

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Token Swap
          </CardTitle>
          {chain && (
            <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
              {chain.name}
            </Badge>
          )}
        </div>
        
        {!isConnected && (
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Network Warning */}
        {isConnected && !isCorrectNetwork && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please switch to Core Testnet 2 to use the token swap.
            </AlertDescription>
          </Alert>
        )}

        {/* Balances Display */}
        {isConnected && isCorrectNetwork && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Balances:</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">tCORE</div>
                <div className="font-mono text-sm">
                  {balances?.core?.formatted ? 
                    parseFloat(balances.core.formatted).toFixed(4) : 
                    "0.0000"
                  }
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">PRFCT</div>
                <div className="font-mono text-sm">
                  {balances?.prfct?.formatted ? 
                    parseFloat(balances.prfct.formatted).toFixed(2) : 
                    "0.00"
                  }
                </div>
              </div>
            </div>
            {balances?.spendingAllowance && (
              <div className="text-center text-xs text-muted-foreground">
                Spending Allowance: {parseFloat(balances.spendingAllowance.formatted).toFixed(2)} PRFCT
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Swap Interface */}
        {isConnected && isCorrectNetwork && (
          <div className="space-y-4">
            {/* From Token Input */}
            <div className="space-y-2">
              <Label>From (tCORE)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={coreAmount}
                  onChange={(e) => setCoreAmount(e.target.value)}
                  className="pr-16"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 px-2 text-xs"
                  onClick={setMaxCoreAmount}
                >
                  MAX
                </Button>
              </div>
              {balances?.core && (
                <div className="text-xs text-muted-foreground">
                  Balance: {parseFloat(balances.core.formatted).toFixed(4)} tCORE
                </div>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* To Token Display */}
            <div className="space-y-2">
              <Label>To (PRFCT)</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-mono">
                  {expectedPRFCT ? 
                    parseFloat(expectedPRFCT.formatted).toFixed(6) : 
                    "0.000000"
                  }
                </div>
              </div>
              {expectedPRFCT && (
                <div className="text-xs text-muted-foreground">
                  {prices ? 
                    "Estimated output (excluding fees)" : 
                    "Estimated output using fallback prices"
                  }
                </div>
              )}
            </div>

            {/* Slippage Setting */}
            <div className="space-y-2">
              <Label>Slippage Tolerance (%)</Label>
              <Input
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Price Information */}
            <div className="text-xs text-muted-foreground space-y-1">
              {prices ? (
                <>
                  <div>tCORE Price: ${parseFloat(prices.core.formatted).toFixed(2)}</div>
                  <div>USDT Price: ${parseFloat(prices.usdt.formatted).toFixed(2)}</div>
                  <div className="text-green-600">✓ Live oracle prices</div>
                </>
              ) : (
                <>
                  <div>tCORE Price: $1.20 (estimated)</div>
                  <div>USDT Price: $1.00 (estimated)</div>
                  <div className="text-yellow-600">⚠ Using fallback prices</div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {needsApprovalAmount && (
                <Button 
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full"
                  variant="outline"
                >
                  {isApproving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    `Approve ${parseFloat(coreAmount).toFixed(4)} tCORE`
                  )}
                </Button>
              )}
              
              <Button 
                onClick={handleSwap}
                disabled={!canSwap || isSwapping}
                className="w-full"
              >
                {isSwapping ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  "Swap Tokens"
                )}
              </Button>
            </div>

            {/* Transaction Links */}
            {(approveHash || swapHash) && (
              <div className="space-y-2 text-xs">
                {approveHash && (
                  <div className="flex items-center gap-2">
                    <span>Approve Tx:</span>
                    <a 
                      href={`${coreTestnet2.blockExplorers.default.url}/tx/${approveHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {swapHash && (
                  <div className="flex items-center gap-2">
                    <span>Swap Tx:</span>
                    <a 
                      href={`${coreTestnet2.blockExplorers.default.url}/tx/${swapHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contract Information */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <div className="font-medium">Contract Info:</div>
          <div>Token: Perfect Pitcher Token (PRFCT)</div>
          <div>Network: Core Testnet 2</div>
          <div>Treasury Fee: 1%</div>
        </div>
      </CardContent>
    </Card>
  )
}
