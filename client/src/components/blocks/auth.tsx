import type * as React from "react"
import { auth } from "@/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { SignOutButton } from "@/components/auth/signout-button"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import type { JSX } from 'react';

export async function AuthMenu(): Promise<JSX.Element> {
  // Используем auth() из next-auth v5
  const session = await auth()
  // Для отладки
  console.log('Сессия пользователя:', session)
  return (
    <div className="space-x-1">
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className={cn(
              buttonVariants({ variant: "user", size: "icon" }),
              "transition-all duration-300 ease-in-out hover:opacity-70"
            )}
          >
            <div className="relative">
              <Avatar className="size-9">
                {session?.user?.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                    className="size-9 rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-muted size-9 cursor-pointer text-xs capitalize">
                    <Icons.user className="size-5" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">
                  {session?.user.name}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild disabled>
                <Link href="/dashboard/account">
                  <Icons.avatar className="mr-2 size-4" aria-hidden="true" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild disabled>
                <Link href="/dashboard/settings">
                  <Icons.settings className="mr-2 size-4" aria-hidden="true" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <SignOutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          aria-label="Get started"
          href="/signup"
          className={cn(buttonVariants({ size: "sm" }), "ml-2")}
        >
          Get Started
          <span className="sr-only">Get Started</span>
        </Link>
      )}
    </div>
  )
}
