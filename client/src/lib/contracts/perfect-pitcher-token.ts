import { Address } from "wagmi"

// Константы из deployment файла
export const PERFECT_PITCHER_TOKEN_ADDRESS: Address = "0xFe442AfE3571dFc30898a2edfCF0E1d2f291cF4A"
export const TREASURY_ADDRESS: Address = "0x457c3b9703a27c4b2e44c57CAeB2E2a9D4e1ADef"

// Адреса токенов на Core Testnet 2
export const CORE_TOKEN_ADDRESS: Address = "0x40375C92d9FAf44d2f9db9Bd9ba41a3317a2404f"
export const USDT_TOKEN_ADDRESS: Address = "0x900101d06A7426441Ae63e9AB3B9b0F63Be145F1"

// ABI для основных функций обменника
export const PERFECT_PITCHER_TOKEN_ABI = [
  // View функции
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Spending allowances
  {
    inputs: [{ name: "user", type: "address" }],
    name: "spendingAllowances",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Swap функция
  {
    inputs: [
      { name: "coreAmount", type: "uint256" },
      { name: "minPRFCTAmount", type: "uint256" }
    ],
    name: "swapCOREtoPRFCT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Price feeds
  {
    inputs: [],
    name: "getCurrentCorePrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentUSDTPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "coreAmount", type: "uint256" },
      { indexed: false, name: "usdtAmount", type: "uint256" },
      { indexed: false, name: "prfctAmount", type: "uint256" },
      { indexed: false, name: "treasuryFee", type: "uint256" }
    ],
    name: "SwapExecuted",
    type: "event",
  },
] as const

// ERC20 ABI для CORE токена
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// Константы для расчетов
export const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
export const SLIPPAGE_TOLERANCE = 500n // 5% в basis points
export const MAX_FEE = 10000n // 100% в basis points
