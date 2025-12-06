"use client"
import { Menu } from "lucide-react"
import { NotificationBell } from "./notification-bell"
import { ProfileDropdown } from "./profile-dropdown"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <button onClick={onMenuClick} className="md:hidden text-foreground hover:bg-muted rounded-lg p-2">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </header>
  )
}
