"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Heart, Brain, Apple, MessageSquare, TrendingUp, LogOut, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import logo from "@/components/layout/logos/Etma.png"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()

  const menuItems = [
    { icon: Heart, label: "Accueil", href: "/home" },
    { icon: Brain, label: "Santé Mentale", href: "/mental-health" },
    { icon: Apple, label: "Nutrition", href: "/nutrition" },
    { icon: MessageSquare, label: "Messagerie", href: "/messaging" },
    { icon: TrendingUp, label: "Rapports", href: "/reports" },
  ]

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => onOpenChange(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative w-64 h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-r border-purple-200/30 flex flex-col transition-transform duration-300 z-50 md:z-0 shadow-xl backdrop-blur-sm",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-200/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
              <img src={logo.src} alt="Logo" className="w-10 h-10 object-contain"/>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Etma'En
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="md:hidden text-gray-700 hover:bg-purple-100/50 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-purple-400 via-pink-200 to-blue-100 text-white shadow-md"
                      : "text-gray-700 hover:bg-purple-50/50 hover:translate-x-1",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-purple-200/30 space-y-3">
          {user && (
            <div className="px-3 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/30">
              <p className="font-medium text-gray-800 truncate">{user.name}</p>
              <p className="text-gray-600 text-xs capitalize">{user.role}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 text-gray-700 border-purple-200/30 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 bg-transparent rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  )
}
