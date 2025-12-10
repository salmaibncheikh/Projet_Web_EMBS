"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Apple, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

interface DashboardStats {
  lastVisit: {
    date: string
    time: string
  }
  mentalHealth: {
    status: string
    color: string
    lastAnalysis: string
  }
  nutrition: {
    percentage: number
    label: string
  }
}

export default function HomePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?._id) return

    const fetchDashboardStats = async () => {
      try {
        // Fetch nutrition stats
        const nutritionResponse = await fetch(`/api/nutrition/dashboard-stats?userId=${user._id}`)
        const nutritionData = await nutritionResponse.json()

        // Fetch mental health records
        const mentalHealthResponse = await fetch(`/api/mental-health/records?userId=${user._id}&days=7`)
        const mentalHealthData = await mentalHealthResponse.json()

        // Calculate last visit (most recent activity from either nutrition or mental health)
        const lastNutritionDate = nutritionData.stats?.recentMeals?.[0]?.date
        const lastMentalHealthDate = mentalHealthData.records?.[0]?.date
        
        const lastActivityDate = [lastNutritionDate, lastMentalHealthDate]
          .filter(Boolean)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]

        const lastVisit = lastActivityDate ? new Date(lastActivityDate) : new Date()
        const today = new Date()
        const isToday = lastVisit.toDateString() === today.toDateString()

        // Calculate mental health status
        const recentRecords = mentalHealthData.records?.slice(0, 5) || []
        let mentalHealthStatus = "Non évalué"
        let mentalHealthColor = "text-gray-500"
        
        if (recentRecords.length > 0) {
          const emotionRecords = recentRecords.filter((r: any) => r.type === 'emotion')
          const chatbotRecords = recentRecords.filter((r: any) => r.type === 'chatbot')
          
          let positiveCount = 0
          let totalCount = 0
          
          // Check emotions
          emotionRecords.forEach((record: any) => {
            totalCount++
            const emotion = record.emotionData?.emotion?.toLowerCase()
            if (['happy', 'joyful', 'content', 'calm', 'relaxed'].includes(emotion)) {
              positiveCount++
            }
          })
          
          // Check chatbot sentiment
          chatbotRecords.forEach((record: any) => {
            totalCount++
            if (record.chatbotData?.sentiment === 'positive') {
              positiveCount++
            }
          })
          
          if (totalCount > 0) {
            const positiveRatio = positiveCount / totalCount
            if (positiveRatio >= 0.7) {
              mentalHealthStatus = "Excellent"
              mentalHealthColor = "text-green-600"
            } else if (positiveRatio >= 0.5) {
              mentalHealthStatus = "Bon"
              mentalHealthColor = "text-accent"
            } else if (positiveRatio >= 0.3) {
              mentalHealthStatus = "Moyen"
              mentalHealthColor = "text-amber-600"
            } else {
              mentalHealthStatus = "Attention"
              mentalHealthColor = "text-red-600"
            }
          }
        }

        // Calculate nutrition balance
        const nutritionGoals = nutritionData.stats?.goals
        const todayNutrition = nutritionData.stats?.today
        
        let nutritionPercentage = 0
        if (nutritionGoals && todayNutrition) {
          const calorieProgress = (todayNutrition.calories / nutritionGoals.dailyCalories) * 100
          const proteinProgress = (todayNutrition.protein / nutritionGoals.dailyProtein) * 100
          const carbsProgress = (todayNutrition.carbs / nutritionGoals.dailyCarbs) * 100
          const fatProgress = (todayNutrition.fat / nutritionGoals.dailyFat) * 100
          
          // Average of all nutrients, capped at 100%
          nutritionPercentage = Math.min(
            Math.round((calorieProgress + proteinProgress + carbsProgress + fatProgress) / 4),
            100
          )
        }

        setStats({
          lastVisit: {
            date: isToday ? "Aujourd'hui" : lastVisit.toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long' 
            }),
            time: lastVisit.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          },
          mentalHealth: {
            status: mentalHealthStatus,
            color: mentalHealthColor,
            lastAnalysis: recentRecords.length > 0 
              ? new Date(recentRecords[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              : "Aucune"
          },
          nutrition: {
            percentage: nutritionPercentage,
            label: todayNutrition?.mealsCount > 0 ? "Cette semaine" : "Aucune donnée"
          }
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [user?._id])
  const services = [
    {
      icon: Brain,
      title: "Santé Mentale",
      description: "Chatbot IA et analyse des émotions par dessin",
      href: "/mental-health",
      color: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      icon: Apple,
      title: "Nutrition",
      description: "Suivi alimentaire et analyse nutritionnelle",
      href: "/nutrition",
      color: "bg-accent-secondary/10",
      iconColor: "text-accent-secondary",
    },
    {
      icon: MessageSquare,
      title: "Messagerie",
      description: "Communiquez avec votre médecin",
      href: "/messaging",
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: TrendingUp,
      title: "Rapports",
      description: "Suivez la progression et les analyses",
      href: "/reports",
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 space-y-8">
      {/* Welcome Section with Animated Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center animate-bounce">
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Bienvenue, {user?.name || 'Utilisateur'}
            </h1>
          </div>
          <p className="text-lg text-white/90 font-medium max-w-2xl leading-relaxed">
            Votre espace personnel pour un suivi complet de votre santé mentale et nutritionnelle
          </p>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Stats with Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Last Visit Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-bl-full"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dernière visite</span>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-xl">📅</span>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-800 mb-1">{stats?.lastVisit.date || "N/A"}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span>🕐</span>
                  {stats?.lastVisit.time || "--:--"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Mental Health Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Santé mentale</span>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-xl">🧠</span>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-28"></div>
              </div>
            ) : (
              <>
                <p className={`text-3xl font-bold mb-1 ${stats?.mentalHealth.color || "text-gray-500"}`}>
                  {stats?.mentalHealth.status || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {stats?.mentalHealth.lastAnalysis ? `Le ${stats.mentalHealth.lastAnalysis}` : "Pas d'analyse"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Nutrition Balance Card with Progress Ring */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-bl-full"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Nutrition</span>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-xl">🥗</span>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke="url(#gradient)"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(stats?.nutrition.percentage || 0) * 1.76} 176`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">{stats?.nutrition.percentage || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{stats?.nutrition.percentage || 0}%</p>
                    <p className="text-sm text-gray-500">{stats?.nutrition.label || "Aucune donnée"}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Services Grid with Enhanced Cards */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">✨</span>
          Nos Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            const gradients = [
              "from-purple-500 to-pink-500",
              "from-green-500 to-emerald-500",
              "from-blue-500 to-cyan-500",
              "from-orange-500 to-red-500"
            ]
            return (
              <Link key={service.href} href={service.href}>
                <div 
                  className="group relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                    <div className="mt-4 flex items-center text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Accéder
                      <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
