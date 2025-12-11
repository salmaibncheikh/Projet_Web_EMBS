"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Apple, MessageSquare, TrendingUp, Sparkles, Activity, Heart, ChevronRight } from "lucide-react"
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
    score: number
  }
  nutrition: {
    percentage: number
    label: string
    calories: number
    goal: number
  }
  weeklyProgress: {
    mentalHealth: number
    nutrition: number
  }
}

export default function HomePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("Bonne journée")

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Bonjour")
    else if (hour < 18) setGreeting("Bon après-midi")
    else setGreeting("Bonsoir")

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
        let mentalHealthScore = 0
        
        if (recentRecords.length > 0) {
          const emotionRecords = recentRecords.filter((r: any) => r.type === 'emotion')
          const chatbotRecords = recentRecords.filter((r: any) => r.type === 'chatbot')
          
          let positiveCount = 0
          let totalCount = 0
          
          emotionRecords.forEach((record: any) => {
            totalCount++
            const emotion = record.emotionData?.emotion?.toLowerCase()
            if (['happy', 'joyful', 'content', 'calm', 'relaxed'].includes(emotion)) {
              positiveCount++
            }
          })
          
          chatbotRecords.forEach((record: any) => {
            totalCount++
            if (record.chatbotData?.sentiment === 'positive') {
              positiveCount++
            }
          })
          
          if (totalCount > 0) {
            const positiveRatio = positiveCount / totalCount
            mentalHealthScore = Math.round(positiveRatio * 100)
            
            if (positiveRatio >= 0.7) {
              mentalHealthStatus = "Excellent"
              mentalHealthColor = "text-emerald-600"
            } else if (positiveRatio >= 0.5) {
              mentalHealthStatus = "Bon"
              mentalHealthColor = "text-accent"
            } else if (positiveRatio >= 0.3) {
              mentalHealthStatus = "Moyen"
              mentalHealthColor = "text-amber-600"
            } else {
              mentalHealthStatus = "À surveiller"
              mentalHealthColor = "text-red-600"
            }
          }
        }

        // Calculate nutrition balance
        const nutritionGoals = nutritionData.stats?.goals
        const todayNutrition = nutritionData.stats?.today
        
        let nutritionPercentage = 0
        let calories = 0
        let goal = 2000
        
        if (nutritionGoals && todayNutrition) {
          calories = todayNutrition.calories
          goal = nutritionGoals.dailyCalories
          
          const calorieProgress = (todayNutrition.calories / nutritionGoals.dailyCalories) * 100
          const proteinProgress = (todayNutrition.protein / nutritionGoals.dailyProtein) * 100
          const carbsProgress = (todayNutrition.carbs / nutritionGoals.dailyCarbs) * 100
          const fatProgress = (todayNutrition.fat / nutritionGoals.dailyFat) * 100
          
          nutritionPercentage = Math.min(
            Math.round((calorieProgress + proteinProgress + carbsProgress + fatProgress) / 4),
            100
          )
        }

        // Calculate weekly progress
        const weeklyProgress = {
          mentalHealth: Math.round(Math.random() * 15 + 5), // Placeholder
          nutrition: Math.round(Math.random() * 20 + 10) // Placeholder
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
              : "Aucune",
            score: mentalHealthScore
          },
          nutrition: {
            percentage: nutritionPercentage,
            label: todayNutrition?.mealsCount > 0 ? "Cette semaine" : "Aucune donnée",
            calories,
            goal
          },
          weeklyProgress
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
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      badge: "Nouveau",
      features: ["Chatbot IA", "Analyse émotionnelle", "Journal de bord"]
    },
    {
      icon: Apple,
      title: "Nutrition",
      description: "Suivi alimentaire et analyse nutritionnelle",
      href: "/nutrition",
      color: "bg-gradient-to-br from-emerald-500 to-green-500",
      badge: "Popular",
      features: ["Suivi calories", "Analyse nutritionnelle", "Objectifs personnels"]
    },
    {
      icon: MessageSquare,
      title: "Messagerie",
      description: "Communiquez avec votre médecin",
      href: "/messaging",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      badge: "Direct",
      features: ["Messages sécurisés", "Téléconsultation", "Partage de documents"]
    },
    {
      icon: TrendingUp,
      title: "Rapports",
      description: "Suivez la progression et les analyses",
      href: "/reports",
      color: "bg-gradient-to-br from-orange-500 to-amber-500",
      badge: "Analytique",
      features: ["Graphiques détaillés", "Tendances", "Recommandations"]
    },
  ]

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl backdrop-blur-sm">
        {/* Subtle light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-pink-50/10"></div>
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiM4YjVhZmYiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2Q4YjJmZiIgc3RvcC1vcGFjaXR5PSIwLjAyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')]"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                    {greeting}, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name || 'Utilisateur'}</span> 
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 mt-1">
                    Votre journée de bien-être commence ici
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Last Visit Card */}
        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dernière visite</span>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Actif</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.lastVisit.date || "Aujourd'hui"}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {stats?.lastVisit.time || "Jamais"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Mental Health Card */}
        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Santé mentale</span>
                <div className="flex items-center gap-2 mt-1">
                  <Heart className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-purple-600 font-medium">Suivi</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">🧠</span>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-28"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-2xl font-bold ${stats?.mentalHealth.color || "text-gray-500"}`}>
                    {stats?.mentalHealth.status || "N/A"}
                  </p>
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full">
                    <span className="text-sm font-bold text-purple-700">{stats?.mentalHealth.score || 0}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {stats?.mentalHealth.lastAnalysis ? `Analyse du ${stats.mentalHealth.lastAnalysis}` : "Pas d'analyse récente"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Nutrition Balance Card */}
        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nutrition</span>
                <div className="flex items-center gap-2 mt-1">
                  <Apple className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Actif</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">🥗</span>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-20"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{stats?.nutrition.percentage || 0}%</p>
                    <p className="text-sm text-gray-600">{stats?.nutrition.label}</p>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32" cy="32" r="30"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32" cy="32" r="30"
                        stroke="url(#nutritionGradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(stats?.nutrition.percentage || 0) * 1.885} 188.5`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="nutritionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#34d399" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{stats?.nutrition.percentage || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {stats?.nutrition.calories || 0} / {stats?.nutrition.goal || 2000} calories
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Nos Services</h2>
          </div>
          <span className="text-sm text-gray-500 font-medium">Tout votre bien-être en un lieu</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Link key={service.href} href={service.href}>
                <div 
                  className="group relative h-full bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer animate-in fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:via-white/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Badge */}
                    {service.badge && (
                      <div className="absolute top-6 right-6">
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full">
                          {service.badge}
                        </span>
                      </div>
                    )}
                    
                    {/* Title and Description */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-purple-600 to-pink-600 transition-all">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    
                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                          <span className="text-xs text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-purple-100 transition-colors">
                      <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Accéder
                      </span>
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-500 transition-all">
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Progression hebdomadaire</h3>
            <p className="text-sm text-gray-600">Vos améliorations cette semaine</p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full">
            <span className="text-sm font-semibold text-purple-700">🎯 Objectifs</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Santé Mentale</p>
                  <p className="text-sm text-gray-500">+{stats?.weeklyProgress.mentalHealth || 0}% cette semaine</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">+{stats?.weeklyProgress.mentalHealth || 0}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((stats?.weeklyProgress.mentalHealth || 0) * 5, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                  <Apple className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nutrition</p>
                  <p className="text-sm text-gray-500">+{stats?.weeklyProgress.nutrition || 0}% cette semaine</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-600">+{stats?.weeklyProgress.nutrition || 0}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((stats?.weeklyProgress.nutrition || 0) * 5, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}