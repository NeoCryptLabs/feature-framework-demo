"use client"

import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  user: {
    name: string
    email: string
    role: string
  }
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/settings": "Settings",
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Dashboard"

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 outline-none hover:bg-accent">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="w-fit text-xs">
                {user.role}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
