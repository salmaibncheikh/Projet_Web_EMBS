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
    <div className="min-h-screen flex items-center justify-center bg-background py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div className="p-3 bg-accent-secondary/10 rounded-lg">
              <Apple className="w-6 h-6 text-accent-secondary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Etma'En</h1>
          <p className="text-muted-foreground mt-2">
            Santé mentale & Nutrition pour toute la famille
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Accédez à votre compte Etma'En</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {successMessage && (
                <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Pas encore de compte ?
              </p>
              <Link href="/signup">
                <Button variant="outline" className="w-full bg-transparent">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
