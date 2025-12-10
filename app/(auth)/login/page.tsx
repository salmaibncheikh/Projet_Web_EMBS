"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Brain, Apple } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const { login, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage("Compte créé avec succès ! Veuillez vous connecter.")
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    try {
      await login(email, password)
      
      // Get user from localStorage to check role
      const storedUser = localStorage.getItem("familyhealth_user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        // Redirect based on role
        if (user.role === "doctor") {
          router.push("/dashboard")
        } else if (user.role === "adolescent") {
          router.push("/teen/dashboard")
        } else {
          router.push("/home")
        }
      } else {
        router.push("/home")
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion. Veuillez réessayer.")
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-400/20 to-purple-500/20 backdrop-blur-sm rounded-xl shadow-sm">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="p-3 bg-gradient-to-br from-pink-400/20 to-pink-500/20 backdrop-blur-sm rounded-xl shadow-sm">
              <Brain className="w-6 h-6 text-pink-600" />
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400/20 to-blue-500/20 backdrop-blur-sm rounded-xl shadow-sm">
              <Apple className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">Etma'En</h1>
          <p className="text-gray-600 font-medium">
            Santé mentale & Nutrition pour toute la famille
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-purple-200/30 shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Connexion</h2>
            <p className="text-gray-600 text-sm mt-1">Accédez à votre compte Etma'En</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
              {successMessage && (
                <div className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200/50 text-green-700 rounded-xl text-sm">
                  {successMessage}
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-purple-200/40 bg-white/60 focus:ring-2 focus:ring-purple-400/50 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-purple-200/40 bg-white/60 focus:ring-2 focus:ring-purple-400/50 rounded-xl"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white rounded-xl shadow-md" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-purple-200/30">
              <p className="text-sm text-gray-600 text-center mb-4">
                Pas encore de compte ?
              </p>
              <Link href="/signup">
                <Button variant="outline" className="w-full bg-white/60 border-purple-200/40 hover:bg-purple-50/50 text-gray-700 rounded-xl">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
      </div>
    </div>
  )
}
