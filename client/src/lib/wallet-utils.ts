import { toast } from "sonner"

export interface NetworkConfig {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export const CORE_TESTNET_2_CONFIG: NetworkConfig = {
  chainId: '0x45A', // 1114 in hex
  chainName: 'Core Testnet 2',
  nativeCurrency: {
    name: 'tCORE',
    symbol: 'tCORE',
    decimals: 18
  },
  rpcUrls: ['https://rpc.test2.btcs.network'],
  blockExplorerUrls: ['https://scan.test2.btcs.network']
}

/**
 * Add or switch to Core Testnet 2 network
 * @returns Promise<boolean> - Success status
 */
export async function addOrSwitchToCoreTestnet(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    toast.error("Please install MetaMask or compatible wallet")
    return false
  }

  try {
    // First try to switch to the network (if already added)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CORE_TESTNET_2_CONFIG.chainId }],
      })
      
      toast.success("Switched to Core Testnet 2 successfully!")
      return true
    } catch (switchError: any) {
      // If error code 4902, network is not added - add it
      if (switchError?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CORE_TESTNET_2_CONFIG]
        })
        
        toast.success("Core Testnet 2 added to wallet successfully!")
        return true
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
      toast.error("Failed to add network. Please add manually.")
    }
    
    return false
  }
}

/**
 * Check if user is on the correct network
 * @param chainId - Current chain ID
 * @returns boolean
 */
export function isCorrectNetwork(chainId?: number): boolean {
  return chainId === 1114 // Core Testnet 2
}

/**
 * Format wallet address for display
 * @param address - Wallet address
 * @param startLength - Number of characters to show at start
 * @param endLength - Number of characters to show at end
 * @returns Formatted address
 */
export function formatAddress(
  address: string, 
  startLength: number = 6, 
  endLength: number = 4
): string {
  if (!address) return ""
  if (address.length <= startLength + endLength) return address
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @param successMessage - Success message to show
 */
export function copyToClipboard(text: string, successMessage?: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(successMessage || "Copied to clipboard!")
    }).catch(() => {
      toast.error("Failed to copy to clipboard")
    })
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      toast.success(successMessage || "Copied to clipboard!")
    } catch {
      toast.error("Failed to copy to clipboard")
    }
    
    document.body.removeChild(textArea)
  }
}

/**
 * Get transaction URL for Core Testnet 2
 * @param hash - Transaction hash
 * @returns Full URL to transaction
 */
export function getTransactionUrl(hash: string): string {
  return `${CORE_TESTNET_2_CONFIG.blockExplorerUrls[0]}/tx/${hash}`
}

/**
 * Get address URL for Core Testnet 2
 * @param address - Contract or wallet address
 * @returns Full URL to address
 */
export function getAddressUrl(address: string): string {
  return `${CORE_TESTNET_2_CONFIG.blockExplorerUrls[0]}/address/${address}`
}
