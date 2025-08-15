"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Wallet, 
  ArrowRight, 
  Info,
  AlertTriangle,
  Copy
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface TutorialStep {
  id: string
  title: string
  description: string
  completed: boolean
  action?: {
    text: string
    href?: string
    onClick?: () => void
  }
}

export function TokenSwapTutorial() {
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: "network",
      title: "Add Core Testnet 2 to MetaMask",
      description: "Configure your wallet to connect to Core Testnet 2 network",
      completed: false,
      action: {
        text: "Add Network",
        onClick: () => addCoreTestnetToWallet(),
      }
    },
    {
      id: "wallet",
      title: "Connect Wallet",
      description: "Connect your MetaMask or compatible wallet to the application",
      completed: false,
    },
    {
      id: "faucet",
      title: "Get Test tCORE",
      description: "Obtain test tCORE tokens from the Core testnet faucet",
      completed: false,
      action: {
        text: "Visit Faucet",
        href: "https://faucet.test.btcs.network/",
      }
    },
    {
      id: "swap",
      title: "Swap tCORE for PRFCT",
      description: "Use our swap interface to exchange tCORE for PRFCT tokens",
      completed: false,
    },
    {
      id: "use",
      title: "Use PRFCT Tokens",
      description: "Start using PRFCT tokens for AI services and platform features",
      completed: false,
    },
  ])

  const addCoreTestnetToWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Сначала пробуем переключиться на сеть (если она уже добавлена)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x45A' }],
          })
          
          // Если переключение прошло успешно, сеть уже есть
          setSteps(prev => prev.map(step => 
            step.id === 'network' ? { ...step, completed: true } : step
          ))
          toast.success("Switched to Core Testnet 2 successfully!")
          return
        } catch (switchError: any) {
          // Если код ошибки 4902, сеть не добавлена - добавляем её
          if (switchError?.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x45A', // 1114 in hex
                chainName: 'Core Testnet 2',
                nativeCurrency: {
                  name: 'tCORE',
                  symbol: 'tCORE',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.test2.btcs.network'],
                blockExplorerUrls: ['https://scan.test2.btcs.network']
              }]
            })
            
            // Mark step as completed
            setSteps(prev => prev.map(step => 
              step.id === 'network' ? { ...step, completed: true } : step
            ))
            
            toast.success("Core Testnet 2 added to wallet successfully!")
          } else {
            throw switchError
          }
        }
      } catch (error: any) {
        console.error('Failed to add/switch network:', error)
        
        // Handle specific error cases
        if (error?.code === 4001) {
          toast.error("Network operation was rejected by user")
        } else if (error?.code === -32602) {
          toast.error("Invalid network parameters")
        } else if (error?.message) {
          toast.error(`Network operation failed: ${error.message}`)
        } else {
          toast.error("Failed to add network. Please add manually using the network details below.")
        }
      }
    } else {
      toast.error("Please install MetaMask or compatible wallet")
    }
  }

  const markStepCompleted = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ))
  }

  const copyContractAddress = () => {
    navigator.clipboard.writeText("0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A")
    toast.success("Contract address copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      {/* Getting Started Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Getting Started with Token Swap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Follow these steps to start swapping tCORE tokens for PRFCT tokens on Core Testnet 2.
          </p>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-medium">
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  
                  {step.action && !step.completed && (
                    <div>
                      {step.action.href ? (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={step.action.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            {step.action.text}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={step.action.onClick}
                        >
                          {step.action.text}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Network Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Core Testnet 2 Details:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono bg-muted p-3 rounded">
              <div>
                <span className="text-muted-foreground">Network Name:</span>
                <br />Core Testnet 2
              </div>
              <div>
                <span className="text-muted-foreground">Chain ID:</span>
                <br />1114 (0x45A)
              </div>
              <div>
                <span className="text-muted-foreground">RPC URL:</span>
                <br />https://rpc.test2.btcs.network
              </div>
              <div>
                <span className="text-muted-foreground">Explorer:</span>
                <br />https://scan.test2.btcs.network
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <div>
                <div className="font-medium">PRFCT Token Contract</div>
                <div className="text-xs text-muted-foreground font-mono">
                  0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyContractAddress}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Token Name:</span>
                <br />Perfect Pitcher Token
              </div>
              <div>
                <span className="text-muted-foreground">Symbol:</span>
                <br />PRFCT
              </div>
              <div>
                <span className="text-muted-foreground">Decimals:</span>
                <br />18
              </div>
              <div>
                <span className="text-muted-foreground">Total Supply:</span>
                <br />1,000,000,000 PRFCT
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This is a testnet environment. All tokens are for testing purposes only and have no real value. 
          Always double-check you're on the correct network before making transactions.
        </AlertDescription>
      </Alert>
    </div>
  )
}
