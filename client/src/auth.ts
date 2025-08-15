import { linkOAuthAccount } from "@/actions/auth"
import { getUserById } from "@/actions/user"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"

import { env } from "@/env.mjs"
import { authOptions } from "@/config/auth"
import { prisma } from "@/config/db"

// Настройка NextAuth для версии 5.x
export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: env.NODE_ENV === "development",
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    verifyRequest: "/signin/magic-link-signin",
  },
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
    updateAge: 24 * 60 * 60, // 24 часа
  },
  events: {
    async linkAccount({ user }) {
      if (user.id) await linkOAuthAccount({ userId: user.id })
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      // hydrate wallet and balance on every jwt callback (user may be undefined on subsequent calls)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { walletAddress: true, tokenBalance: true, id: true, role: true },
        })
        if (dbUser) {
          ;(token as any).walletAddress = dbUser.walletAddress
          ;(token as any).tokenBalance = dbUser.tokenBalance
          token.sub = dbUser.id
          token.role = dbUser.role
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as "USER" | "ADMIN"
      ;(session.user as any).walletAddress = (token as any).walletAddress ?? null
      ;(session.user as any).tokenBalance = (token as any).tokenBalance ?? 0
      ;(session.user as any).id = token.sub
      return session
    },
    async signIn({ user, account }) {
      if (!user.id) return false
      if (account?.provider !== "credentials") return true

      const existingUser = await getUserById({ id: user.id })

      return !existingUser?.emailVerified ? false : true
    },
  },
  adapter: PrismaAdapter(prisma),
  ...authOptions,
})

// Экспортируем обработчики для API роутов
export const { GET, POST } = handlers
