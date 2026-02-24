"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

const adminNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const items = user.role === "ADMIN" ? [...navItems, ...adminNavItems] : navItems

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <span className="text-lg font-bold">PulseBoard</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
