import { createPublicClient, http, parseAbiItem } from "viem"
import { base, mainnet, polygon, arbitrum } from "wagmi/chains"

type VerifyArgs = { txHash: string; userWallet: string }

const CHAINS = [mainnet, base, polygon, arbitrum]

export async function verifyOnchainMint(
  args: VerifyArgs
): Promise<{ valid: boolean; amount: number; contract?: string; chainId?: number; error?: string }> {
  const { txHash, userWallet } = args
  try {
    // Перебираем поддерживаемые сети и пытаемся прочитать событие Transfer для ERC20
    for (const chain of CHAINS) {
      const client = createPublicClient({ chain, transport: http() })
      try {
        const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` })
        if (!receipt) continue

        // Пробуем найти событие Transfer к userWallet
        const transferTopic = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)")
        for (const log of receipt.logs) {
          try {
            const parsed = client.decodeEventLog({ abi: [transferTopic], data: log.data, topics: log.topics })
            if (
              parsed.eventName === "Transfer" &&
              (parsed.args as any)?.to?.toLowerCase() === userWallet.toLowerCase()
            ) {
              const amount = Number((parsed.args as any)?.value || 0)
              return { valid: true, amount, contract: log.address, chainId: chain.id }
            }
          } catch {}
        }
      } catch {}
    }
    return { valid: false, amount: 0, error: "Transfer to user not found across supported chains" }
  } catch (e: any) {
    return { valid: false, amount: 0, error: e.message }
  }
}













