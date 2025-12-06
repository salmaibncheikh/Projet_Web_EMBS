"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart, Brain, Apple } from "lucide-react"
import { useAuth, type UserRole } from "@/lib/auth-context"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "mother" as UserRole,
  })
  const [error, setError] = useState("")
  const { signup, loading } = useAuth()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    try {
      await signup(formData.name, formData.email, formData.password, formData.role)
      // Redirect to login page after successful signup
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte. Veuillez réessayer.")
      console.error(err)
    }
  }

  const roles = [
    { value: "mother", label: "Mère", icon: Heart, color: "text-primary", description: "Accès au dashboard familial" },
    { value: "doctor", label: "Médecin", icon: Brain, color: "text-accent", description: "Accès au dashboard médical" },
  ]

  return (
    <div className="min-h-screen flex flex-col justify-center bg-background px-4">
      <div className="w-full max-w-md mx-auto">
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
          <h1 className="text-3xl font-bold text-foreground">FamilyHealth</h1>
          <p className="text-muted-foreground mt-2">Créez votre compte</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>Rejoignez notre communauté de santé familiale</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Votre rôle</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <div className="space-y-3">
                    {roles.map((role) => {
                      const Icon = role.icon
                      return (
                        <div
                          key={role.value}
                          className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all"
                        >
                          <RadioGroupItem value={role.value} id={role.value} />
                          <Label
                            htmlFor={role.value}
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <div className={`p-2 rounded-lg ${role.color.replace('text-', 'bg-')}/10`}>
                              <Icon className={`w-5 h-5 ${role.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">{role.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{role.description}</div>
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full btn-primary" disabled={loading}>
                {loading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Vous avez déjà un compte ?
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Se connecter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
