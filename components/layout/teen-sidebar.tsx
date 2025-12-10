"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { 
  LayoutDashboard, 
  Heart, 
  Brain, 
  Apple, 
  Activity,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  Target,
  Pill
} from "lucide-react"

export default function TeenSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de Bord", href: "/teen/dashboard" },
    { icon: Target, label: "Suivi Santé", href: "/teen/health-tracking" },
    { icon: Apple, label: "Nutrition", href: "/teen/nutrition" },
    { icon: Brain, label: "Santé Mentale", href: "/teen/brain-health" },
    { icon: Pill, label: "Médicaments", href: "/teen/medication" },
    { icon: BookOpen, label: "Académie Santé", href: "/teen/academy" },
    { icon: MessageSquare, label: "Messagerie", href: "/teen/messaging" },
    { icon: Settings, label: "Paramètres", href: "/teen/profile" },
  ]

  return (
    <aside className="w-64 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-r border-blue-200/30 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-blue-200/30">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-md">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Teen Hub
            </h1>
            <p className="text-xs text-gray-600">Ma santé, mon futur</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-blue-50/50 hover:translate-x-1"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-blue-200/30">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/30 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400/70 to-purple-400/70 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/60 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Adolescent</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/60 hover:bg-red-50/80 text-gray-700 hover:text-red-600 rounded-xl border border-blue-200/30 hover:border-red-300/50 transition-all duration-200 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
