import type { Metadata } from "next"
import Link from "next/link"
import { getUserByResetPasswordToken } from "@/actions/user"

import { env } from "@/env.mjs"

import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PasswordUpdateForm } from "@/components/forms/password-update-form"
import { Icons } from "@/components/icons"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Password Update",
  description: "Set your new password",
}

type PasswordUpdatePageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PasswordUpdatePage({
  searchParams,
}: PasswordUpdatePageProps) {
  const resolvedSearchParams = (await (searchParams ?? Promise.resolve({}))) as {
    [key: string]: string | string[] | undefined
  }
  if (resolvedSearchParams.token) {
    const user = await getUserByResetPasswordToken({
      token: String(resolvedSearchParams.token),
    })

    if (!user) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center">
          <Card className="max-sm:flex max-sm:h-screen max-sm:w-full max-sm:flex-col max-sm:items-center max-sm:justify-center max-sm:rounded-none max-sm:border-none sm:min-w-[370px] sm:max-w-[368px]">
            <CardHeader>
              <CardTitle>Invalid Reset Password Token</CardTitle>
              <CardDescription>
                Please return to the sign in page and try again
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                aria-label="Go back to sign in page"
                href="/signin"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "w-full"
                )}
              >
                <Icons.arrowLeft className="mr-2 size-4" />
                <span className="sr-only">Try again</span>
                Try again
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="max-sm:flex max-sm:h-screen max-sm:w-full max-sm:flex-col max-sm:items-center max-sm:justify-center max-sm:rounded-none max-sm:border-none sm:min-w-[370px] sm:max-w-[368px]">
          <CardHeader>
            <CardTitle>Password Update</CardTitle>
            <CardDescription>Set your new password</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <PasswordUpdateForm
              resetPasswordToken={String(resolvedSearchParams.token)}
            />
            <Link
              aria-label="Cancel password update"
              href="/signin"
              className={buttonVariants({ variant: "outline" })}
            >
              <span className="sr-only">Cancel password update</span>
              Cancel
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  } else {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="max-sm:flex max-sm:h-screen max-sm:w-full max-sm:flex-col max-sm:items-center max-sm:justify-center max-sm:rounded-none max-sm:border-none sm:min-w-[370px] sm:max-w-[368px]">
          <CardHeader>
            <CardTitle>Missing Reset Password Token</CardTitle>
            <CardDescription>
              Please return to the sign in page and try again
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              aria-label="Go back to sign in page"
              href="/signin"
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              <Icons.arrowLeft className="mr-2 size-4" />
              <span className="sr-only">Try again</span>
              Try again
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}
