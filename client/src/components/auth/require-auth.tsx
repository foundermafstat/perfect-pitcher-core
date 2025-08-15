import auth from "@/lib/auth"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export async function RequireAuth({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  return <>{children}</>
}
