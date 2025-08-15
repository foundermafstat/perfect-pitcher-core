import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { auth } from "@/auth"

import { siteConfig } from "@/config/site"
import { StoryProvider } from "@/lib/StoryContext"
import { googleFonts } from "@/lib/fonts"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Analytics } from "@/components/analytics"
import { AppSidebar } from "@/components/app-sidebar"
//import { ModeSwitcher } from "@/components/mode-switcher"
import { TranslationsProvider } from "@/providers/translations-context"

import "./globals.css"
import { cn } from "@/lib/utils"
import { ActiveThemeProvider } from "@/components/active-theme"
import { LanguageSwitcher } from '@/components/language-switcher';
import { Header } from '@/components/blocks/header';
import { ThemeProvider } from '@/components/theme-provider';
import { NextAuthProvider } from '@/providers/auth-provider';
import { AgentSidebarProvider } from '@/providers/agent-sidebar-context';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { AgentSidebarSlot } from '@/components/agent-sidebar-slot';


import { WagmiClientProvider } from "@/providers/wagmi-provider";
import '@rainbow-me/rainbowkit/styles.css';

// removed unused wrappers that broke JSX nesting

const META_THEME_COLORS = {
  light: "#afffff",
  dark: "#333333",
}



export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "Server Components",
    "Radix UI",
  ],
  authors: [
    {
      name: "shadcn",
      url: "https://shadcn.com",
    },
  ],
  creator: "shadcn",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@shadcn",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  const activeThemeValue = cookieStore.get("active_theme")?.value
  const session = await auth()
 

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          ...(googleFonts?.map((font) => font.variable) || [])
        )}
      >
        <WagmiClientProvider>
          <ThemeProvider>
            <NextAuthProvider session={session}>
              <ActiveThemeProvider initialTheme={activeThemeValue}>
                <TranslationsProvider>
                  <StoryProvider>
                    <AgentSidebarProvider>
                      <SidebarProvider defaultOpen={defaultOpen}>
                        <AppSidebar />
                        <SidebarInset>
                          <Header />
                          <div className="h-[calc(100vh-58px)] w-full overflow-hidden">{/* 58px ~ h-14 header */}
                            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                              <ResizablePanel defaultSize={75} minSize={50} className="min-w-0">
                                <div className="h-full w-full overflow-auto [scrollbar-width:thin]">
                                  {children}
                                </div>
                              </ResizablePanel>
                              <AgentSidebarSlot />
                            </ResizablePanelGroup>
                          </div>
                        </SidebarInset>
                      </SidebarProvider>
                    </AgentSidebarProvider>
                    <Toaster />
                    <Analytics />
                  </StoryProvider>
                </TranslationsProvider>
              </ActiveThemeProvider>
            </NextAuthProvider>
          </ThemeProvider>
        </WagmiClientProvider>
      </body>
    </html>
  )
}
