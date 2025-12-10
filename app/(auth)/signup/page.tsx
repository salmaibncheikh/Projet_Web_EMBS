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
import { Heart, Brain, Apple, Sparkles } from "lucide-react"
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
    { value: "mother", label: "Mère", icon: Heart, color: "text-purple", description: "Accès au dashboard familial" },
    { value: "doctor", label: "Médecin", icon: Brain, color: "text-pink", description: "Accès au dashboard médical" },
    { value: "adolescent", label: "Adolescent", icon: Sparkles, color: "text-blue", description: "Mon espace santé personnel" },
  ]

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4 py-10">
      <div className="w-full max-w-md mx-auto">
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
          <p className="text-gray-600 font-medium">Créez votre compte</p>
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-purple-200/30 shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Inscription</h2>
            <p className="text-gray-600 text-sm mt-1">Rejoignez notre communauté de santé familiale</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-xl text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-purple-200/40 bg-white/60 focus:ring-2 focus:ring-purple-400/50 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-purple-200/40 bg-white/60 focus:ring-2 focus:ring-purple-400/50 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Votre rôle</Label>
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
                          className="flex items-center space-x-3 p-4 rounded-xl border-2 border-purple-200/40 bg-white/40 hover:border-purple-400/60 hover:bg-purple-50/30 cursor-pointer transition-all"
                        >
                          <RadioGroupItem value={role.value} id={role.value} />
                          <Label
                            htmlFor={role.value}
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${
                              role.color === 'text-purple' ? 'from-purple-400/20 to-purple-500/20' : 
                              role.color === 'text-pink' ? 'from-pink-400/20 to-pink-500/20' : 
                              'from-blue-400/20 to-blue-500/20'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                role.color === 'text-purple' ? 'text-purple-600' : 
                                role.color === 'text-pink' ? 'text-pink-600' : 
                                'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{role.label}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{role.description}</div>
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-purple-200/40 bg-white/60 focus:ring-2 focus:ring-purple-400/50 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="border-purple-200/40 bg-white/60 focus:ring-2 focus:ring-purple-400/50 rounded-xl"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white rounded-xl shadow-md" disabled={loading}>
                {loading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-purple-200/30">
              <p className="text-sm text-gray-600 text-center mb-4">
                Vous avez déjà un compte ?
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-white/60 border-purple-200/40 hover:bg-purple-50/50 text-gray-700 rounded-xl">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
      </div>
    </div>
  )
}
