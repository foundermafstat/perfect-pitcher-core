import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatUnits, parseUnits } from "viem"
import { 
  PERFECT_PITCHER_TOKEN_ADDRESS, 
  CORE_TOKEN_ADDRESS,
  PERFECT_PITCHER_TOKEN_ABI,
  ERC20_ABI,
  MAX_UINT256,
  SLIPPAGE_TOLERANCE,
  MAX_FEE
} from "@/lib/contracts/perfect-pitcher-token"
import { coreTestnet2 } from "@/lib/wagmi"
import { useMemo } from "react"

export function usePerfectPitcherToken() {
  const { address, isConnected } = useAccount()
  
  // Балансы
  const { data: coreBalance } = useBalance({
    address,
    chainId: coreTestnet2.id,
  })

  const { data: prfctBalance } = useReadContract({
    address: PERFECT_PITCHER_TOKEN_ADDRESS,
    abi: PERFECT_PITCHER_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: coreTestnet2.id,
  })

  const { data: spendingAllowance } = useReadContract({
    address: PERFECT_PITCHER_TOKEN_ADDRESS,
    abi: PERFECT_PITCHER_TOKEN_ABI,
    functionName: "spendingAllowances",
    args: address ? [address] : undefined,
    chainId: coreTestnet2.id,
  })

  // Цены
  const { data: corePrice } = useReadContract({
    address: PERFECT_PITCHER_TOKEN_ADDRESS,
    abi: PERFECT_PITCHER_TOKEN_ABI,
    functionName: "getCurrentCorePrice",
    chainId: coreTestnet2.id,
  })

  const { data: usdtPrice } = useReadContract({
    address: PERFECT_PITCHER_TOKEN_ADDRESS,
    abi: PERFECT_PITCHER_TOKEN_ABI,
    functionName: "getCurrentUSDTPrice",
    chainId: coreTestnet2.id,
  })

  // Allowance для CORE токена
  const { data: coreAllowance } = useReadContract({
    address: CORE_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, PERFECT_PITCHER_TOKEN_ADDRESS] : undefined,
    chainId: coreTestnet2.id,
  })

  // Write contracts
  const { writeContract: writeContractApprove, data: approveHash } = useWriteContract()
  const { writeContract: writeContractSwap, data: swapHash } = useWriteContract()

  // Transaction receipts
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  const { isLoading: isSwapping } = useWaitForTransactionReceipt({
    hash: swapHash,
  })

  // Расчеты
  const balances = useMemo(() => {
    return {
      core: coreBalance ? {
        value: coreBalance.value,
        formatted: coreBalance.formatted,
        symbol: coreBalance.symbol,
      } : null,
      prfct: prfctBalance ? {
        value: prfctBalance,
        formatted: formatUnits(prfctBalance, 18),
        symbol: "PRFCT",
      } : null,
      spendingAllowance: spendingAllowance ? {
        value: spendingAllowance,
        formatted: formatUnits(spendingAllowance, 18),
      } : null,
    }
  }, [coreBalance, prfctBalance, spendingAllowance])

  const prices = useMemo(() => {
    if (!corePrice || !usdtPrice) return null
    
    return {
      core: {
        value: corePrice,
        formatted: formatUnits(corePrice, 8), // Chainlink обычно использует 8 decimals
      },
      usdt: {
        value: usdtPrice,
        formatted: formatUnits(usdtPrice, 8),
      },
    }
  }, [corePrice, usdtPrice])

  // Функция для расчета ожидаемого количества PRFCT
  const calculateExpectedPRFCT = (coreAmount: string) => {
    if (!coreAmount || coreAmount === "0" || coreAmount === "") return null
    
    try {
      const coreAmountBigInt = parseUnits(coreAmount, 18)
      if (coreAmountBigInt <= 0n) return null
      
      // Используем fallback цены если оракулы недоступны
      let corePriceValue: bigint
      let usdtPriceValue: bigint
      
      if (prices?.core?.value && prices?.usdt?.value) {
        corePriceValue = prices.core.value
        usdtPriceValue = prices.usdt.value
      } else {
        // Fallback цены для тестнета (примерные значения)
        corePriceValue = parseUnits("1.2", 8) // $1.2 за CORE
        usdtPriceValue = parseUnits("1.0", 8) // $1.0 за USDT
        console.warn("Using fallback prices for calculation")
      }
      
      // Валидация цен
      if (corePriceValue <= 0n || usdtPriceValue <= 0n) {
        console.error("Invalid price values:", { corePriceValue, usdtPriceValue })
        return null
      }
      
      // CORE -> USD -> PRFCT (упрощенный расчет)
      // Предполагаем курс 1 USD = 1 PRFCT для тестнета
      const usdValue = (coreAmountBigInt * corePriceValue) / (10n ** 8n)
      const prfctAmount = (usdValue * (10n ** 8n)) / usdtPriceValue
      
      if (prfctAmount <= 0n) {
        console.error("Calculated PRFCT amount is zero or negative")
        return null
      }
      
      return {
        value: prfctAmount,
        formatted: formatUnits(prfctAmount, 18),
      }
    } catch (error) {
      console.error("Error calculating expected PRFCT:", error)
      return null
    }
  }

  // Функция для approve CORE токенов
  const approveCORE = async (amount: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    const amountBigInt = amount === "max" ? MAX_UINT256 : parseUnits(amount, 18)
    
    writeContractApprove({
      address: CORE_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [PERFECT_PITCHER_TOKEN_ADDRESS, amountBigInt],
      chainId: coreTestnet2.id,
    })
  }

  // Функция для свапа CORE -> PRFCT
  const swapCOREToPRFCT = async (coreAmount: string, slippagePercent: number = 5) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    if (!coreAmount || coreAmount === "0" || coreAmount === "") {
      throw new Error("Invalid CORE amount")
    }

    try {
      const coreAmountBigInt = parseUnits(coreAmount, 18)
      if (coreAmountBigInt <= 0n) {
        throw new Error("CORE amount must be greater than 0")
      }

      const expectedPRFCT = calculateExpectedPRFCT(coreAmount)
      
      if (!expectedPRFCT || expectedPRFCT.value <= 0n) {
        // Используем минимальную сумму для тестнета если расчет не удался
        console.warn("Unable to calculate expected PRFCT, using minimum amount")
        const minPRFCTFallback = coreAmountBigInt / 10n // 0.1 от суммы CORE как fallback
        
        writeContractSwap({
          address: PERFECT_PITCHER_TOKEN_ADDRESS,
          abi: PERFECT_PITCHER_TOKEN_ABI,
          functionName: "swapCOREtoPRFCT",
          args: [coreAmountBigInt, minPRFCTFallback],
          chainId: coreTestnet2.id,
        })
        return
      }

      // Применяем slippage tolerance
      const slippageBigInt = BigInt(Math.floor(slippagePercent * 100)) // конвертируем в basis points
      const minPRFCT = (expectedPRFCT.value * (MAX_FEE - slippageBigInt)) / MAX_FEE

      if (minPRFCT <= 0n) {
        throw new Error("Calculated minimum PRFCT amount is too low")
      }

      writeContractSwap({
        address: PERFECT_PITCHER_TOKEN_ADDRESS,
        abi: PERFECT_PITCHER_TOKEN_ABI,
        functionName: "swapCOREtoPRFCT",
        args: [coreAmountBigInt, minPRFCT],
        chainId: coreTestnet2.id,
      })
    } catch (error) {
      console.error("Error in swapCOREToPRFCT:", error)
      throw error
    }
  }

  // Проверка, нужно ли делать approve
  const needsApproval = (amount: string) => {
    if (!coreAllowance || !amount) return false
    
    try {
      const amountBigInt = parseUnits(amount, 18)
      return coreAllowance < amountBigInt
    } catch {
      return false
    }
  }

  return {
    // Состояние
    isConnected,
    address,
    balances,
    prices,
    
    // Транзакции
    isApproving,
    isSwapping,
    
    // Функции
    approveCORE,
    swapCOREToPRFCT,
    calculateExpectedPRFCT,
    needsApproval,
    
    // Хэши транзакций для отслеживания
    approveHash,
    swapHash,
  }
}
