import { Metadata } from "next"
import { TokenSwap } from "@/components/token-swap"
import { TokenSwapTutorial } from "@/components/token-swap-tutorial"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Token Swap - Perfect Pitcher",
  description: "Exchange tCORE for PRFCT tokens on Core Testnet 2",
}

export default function TokenSwapPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Token Swap</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Exchange your tCORE tokens for PRFCT tokens to use Perfect Pitcher services
          </p>
        </div>

        {/* Swap Interface with Tutorial */}
        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="swap">Swap Tokens</TabsTrigger>
            <TabsTrigger value="tutorial">Getting Started</TabsTrigger>
          </TabsList>
          <TabsContent value="swap" className="space-y-6">
            <TokenSwap />
          </TabsContent>
          <TabsContent value="tutorial" className="space-y-6">
            <TokenSwapTutorial />
          </TabsContent>
        </Tabs>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-lg font-semibold">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Connect your wallet to Core Testnet 2</li>
              <li>• Enter the amount of tCORE you want to swap</li>
              <li>• Approve the transaction (one-time setup)</li>
              <li>• Execute the swap to receive PRFCT tokens</li>
              <li>• Use PRFCT tokens for AI services</li>
            </ul>
          </div>

          <div className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-lg font-semibold">What are PRFCT tokens?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Utility tokens for Perfect Pitcher platform</li>
              <li>• Used for AI content generation</li>
              <li>• Required for voice broadcast sessions</li>
              <li>• Can be earned through platform usage</li>
              <li>• Deflationary tokenomics</li>
            </ul>
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-semibold">Technical Details</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Contract Addresses:</h4>
              <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                <li>PRFCT: 0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A</li>
                <li>Treasury: 0x457c3b9703a27c4b2e44c57CAeB2E2a9D4e1ADef</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Swap Details:</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Treasury Fee: 1%</li>
                <li>• Max Slippage: 5%</li>
                <li>• Route: tCORE → USDT → PRFCT</li>
                <li>• Oracle: Chainlink Price Feeds</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Testnet Notice
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This is a testnet environment. Tokens have no real value and are used for testing purposes only. 
            Make sure you're connected to Core Testnet 2 network.
          </p>
        </div>
      </div>
    </div>
  )
}
