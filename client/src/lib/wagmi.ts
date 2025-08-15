import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { http } from "wagmi"
import type { Chain } from "wagmi/chains"
import { mainnet, polygon, base, arbitrum } from "wagmi/chains"

export const coreTestnet2: Chain = {
  id: 1114,
  name: "Core Testnet 2",
  nativeCurrency: { name: "tCORE", symbol: "tCORE", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.test2.btcs.network"] },
    public: { http: ["https://rpc.test2.btcs.network"] },
  },
  blockExplorers: {
    default: { name: "Core Testnet Scan", url: "https://scan.test2.btcs.network" },
  },
  testnet: true,
}

export const wagmiConfig = getDefaultConfig({
  appName: "Perfect Pitcher",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [coreTestnet2, base, polygon, arbitrum, mainnet],
  transports: {
    [coreTestnet2.id]: http("https://rpc.test2.btcs.network"),
    [base.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
  },
})


