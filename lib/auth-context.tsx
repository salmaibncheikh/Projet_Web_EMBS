"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "mother" | "doctor"

export interface User {
  id: string
  _id?: string // MongoDB ObjectId from chat backend
  name: string
  email: string
  role: UserRole
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Don't auto-login on mount - removed localStorage check
  useEffect(() => {
    // Check if there's a stored session but don't automatically set it
    // User needs to explicitly login
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      if (data.success && data.user) {
        // Also login to chat backend to get chat user ID
        let chatUserId = null
        try {
          const chatResponse = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
          })
          
          if (chatResponse.ok) {
            const chatUser = await chatResponse.json()
            chatUserId = chatUser._id
            console.log('Chat backend login successful, user ID:', chatUserId)
          }
        } catch (chatError) {
          console.warn('Chat backend login failed:', chatError)
          // Don't fail the main login if chat backend is down
        }
        
        // Merge Next.js user with chat backend user ID
        const completeUser = {
          ...data.user,
          _id: chatUserId || data.user._id, // Use chat backend ID or fallback to Next.js ID
          password: password // Store temporarily for chat backend auth
        }
        
        setUser(completeUser)
        localStorage.setItem("familyhealth_user", JSON.stringify(completeUser))
      } else {
        throw new Error('Réponse invalide du serveur')
      }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du compte')
      }

      if (data.success && data.user) {
        // Also create user in chat backend
        try {
          const chatResponse = await fetch('http://localhost:8081/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, email, password, role })
          })
          
          if (!chatResponse.ok) {
            const errorText = await chatResponse.text()
            console.error('Chat backend signup error (status ' + chatResponse.status + '):', errorText)
            try {
              const chatError = JSON.parse(errorText)
              console.error('Parsed error:', chatError)
            } catch (e) {
              console.error('Could not parse error as JSON')
            }
          } else {
            console.log('Chat backend signup successful!')
          }
        } catch (chatError) {
          console.error('Chat backend signup failed:', chatError)
          // Don't fail the main signup if chat backend is down
        }
        
        // Don't auto-login after signup, redirect to login page
      } else {
        throw new Error('Réponse invalide du serveur')
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("familyhealth_user")
  }

  return <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
