"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import TeenSidebar from "@/components/layout/teen-sidebar"

export default function TeenLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "adolescent") {
      // Redirect non-teens to their appropriate dashboard
      if (user.role === "mother") {
        router.push("/home")
      } else if (user.role === "doctor") {
        router.push("/dashboard")
      }
    }
  }, [user, router])

  if (!user || user.role !== "adolescent") {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-emerald-50/40">
      <TeenSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
