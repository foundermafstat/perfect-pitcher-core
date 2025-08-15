"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"

export function WalletConnectButton() {
  return (
    <ConnectButton
      showBalance={{ smallScreen: true, largeScreen: true }}
      chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
      accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
    />
  )
}
