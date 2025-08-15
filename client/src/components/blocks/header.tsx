// import { useTranslations } from "@/providers/translations-context"
import { motion } from "framer-motion"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AuthMenu } from "@/components/blocks/auth"
import { LanguageSwitcher } from "@/components/language-switcher"
import { NavHeader } from "@/components/nav-header"
import { ThemeSelector } from "@/components/theme-selector"
import { AgentSidebarToggleButton } from "@/components/agent-sidebar-toggle"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { TokenBalance } from "@/components/token-balance"

export function Header() {
  // const { t } = useTranslations()
  return (
    <>
      <header
        className="bg-background sticky inset-x-0 top-0 isolate z-10 flex shrink-0 items-center gap-2 border-b"
      >
        <div className="flex h-14 w-full items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1.5" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <NavHeader />
          <div className="ml-auto flex items-center gap-2">
            
            <AgentSidebarToggleButton />
            <LanguageSwitcher />
            {/* <ThemeSelector /> */}
            <ThemeToggle />
            {/* <AuthMenu /> */}
            <div className="flex items-center gap-3">
              <TokenBalance tokenAddress={process.env.NEXT_PUBLIC_CORE_TESTNET2_FAUCET_TOKEN as `0x${string}`} label="tCORE" />
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
