"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { 
  Target, 
  Heart, 
  Brain, 
  Apple, 
  Activity,
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  Pill,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Flame,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export default function TeenDashboard() {
  const { user } = useAuth()
  const [currentStreak, setCurrentStreak] = useState(0)
  const [todayActivities, setTodayActivities] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) return
      
      try {
        // Log login activity
        await fetch('/api/teen/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            activityType: 'login'
          })
        })

        // Fetch streak and activities
        const response = await fetch(`/api/teen/activities?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentStreak(data.currentStreak)
          setTodayActivities(data.todayActivities)
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-emerald-50/40 p-6 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-emerald-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <span className="text-4xl">👋</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                Salut {user?.name?.split(' ')[0]} !
              </h1>
              <p className="text-white/90 mt-1 font-medium">Prends soin de ta santé aujourd'hui</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-white font-bold">{currentStreak} jours</span>
              </div>
              <p className="text-white/80 text-xs mt-0.5">Série active</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">3 badges</span>
              </div>
              <p className="text-white/80 text-xs mt-0.5">Cette semaine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Goals Today */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Tes missions aujourd'hui</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mission 1 - Symptom Tracking */}
          <Link href="/teen/health-tracking">
            <div className="bg-gradient-to-br from-blue-50/60 to-blue-100/40 rounded-xl p-4 border border-blue-200/40 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400/70 to-blue-500/70 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                {(todayActivities.symptom_logged > 0 || todayActivities.mood_logged > 0) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Logger mes symptômes</h3>
              <p className="text-xs text-gray-600">
                {todayActivities.symptom_logged > 0 ? 'Complété ✓' : 'Suivi quotidien'}
              </p>
            </div>
          </Link>

          {/* Mission 2 - Nutrition */}
          <Link href="/teen/nutrition">
            <div className="bg-gradient-to-br from-emerald-50/60 to-emerald-100/40 rounded-xl p-4 border border-emerald-200/40 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/70 to-emerald-500/70 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Apple className="w-6 h-6 text-white" />
                </div>
                {todayActivities.meal_scanned >= 3 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{Math.max(0, 3 - (todayActivities.meal_scanned || 0))}</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Scanner mes repas</h3>
              <p className="text-xs text-gray-600">
                {todayActivities.meal_scanned || 0}/3 repas scannés
              </p>
            </div>
          </Link>

          {/* Mission 3 - Brain Test */}
          <Link href="/teen/brain-health">
            <div className="bg-gradient-to-br from-purple-50/60 to-purple-100/40 rounded-xl p-4 border border-purple-200/40 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400/70 to-purple-500/70 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                {todayActivities.brain_test > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Test cognitif</h3>
              <p className="text-xs text-gray-600">
                {todayActivities.brain_test > 0 ? 'Complété ✓' : '5 min à faire'}
              </p>
            </div>
          </Link>

          {/* Mission 4 */}
          <Link href="/teen/academy">
            <div className="bg-gradient-to-br from-orange-50/60 to-orange-100/40 rounded-xl p-4 border border-orange-200/40 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400/70 to-orange-500/70 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Apprendre</h3>
              <p className="text-xs text-gray-600">Nouveau module dispo</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Health Tracking Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Symptom Tracking */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400/70 to-red-500/70 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">Symptômes</h3>
            </div>
            <Link href="/teen/health-tracking" className="text-xs text-blue-600 hover:underline font-medium">
              Voir tout
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Maux de tête</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">3 cette semaine</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Fatigue</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Stable</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Sommeil</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">7.5h/nuit</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-200/40">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Conseil :</span> Tes maux de tête surviennent souvent après le déjeuner. Essaie de boire plus d'eau !
              </p>
            </div>
          </div>
        </div>

        {/* Mood Tracking */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400/70 to-purple-500/70 rounded-xl flex items-center justify-center shadow-sm">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">Humeur</h3>
            </div>
            <Link href="/teen/brain-health" className="text-xs text-purple-600 hover:underline font-medium">
              Analyser
            </Link>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {['😢', '😕', '😐', '🙂', '😊'].map((emoji, idx) => (
                <button
                  key={idx}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    idx === 3 ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">Comment te sens-tu aujourd'hui ?</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Cette semaine</span>
              <span className="font-semibold text-gray-800">Plutôt bien 🙂</span>
            </div>
            <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-purple-400 to-purple-500"></div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-50/60 rounded-xl border border-purple-200/40">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Progrès :</span> Ton humeur s'améliore depuis 2 semaines ! Continue comme ça 💪
              </p>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-emerald-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/70 to-emerald-500/70 rounded-xl flex items-center justify-center shadow-sm">
                <Apple className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">Nutrition</h3>
            </div>
            <Link href="/teen/nutrition" className="text-xs text-emerald-600 hover:underline font-medium">
              Détails
            </Link>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Calories aujourd'hui</span>
                <span className="font-semibold text-gray-800">1,450 / 2,200</span>
              </div>
              <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Protéines</span>
                <span className="font-semibold text-gray-800">45g / 70g</span>
              </div>
              <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-gradient-to-r from-blue-400 to-blue-500"></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/40">
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Objectif :</span> Super ! Tu as mangé 3 fruits aujourd'hui 🍎🍌🍊
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <Link href="/teen/academy">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400/70 to-orange-500/70 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Apprendre</h3>
                <p className="text-xs text-gray-600">Nouveau contenu</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">Module : Prévention du diabète</p>
          </div>
        </Link>

        <Link href="/teen/messaging">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/70 to-cyan-400/70 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Messages</h3>
                <p className="text-xs text-gray-600">2 nouveaux</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">Dr. Martin a répondu</p>
          </div>
        </Link>

        <Link href="/teen/cognitive-games">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400/70 to-pink-400/70 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Jeux Cognitifs</h3>
                <p className="text-xs text-gray-600">Améliore ta mémoire</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">Score du jour : 85/100</p>
          </div>
        </Link>
      </div>

      {/* Learning Progress */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-800">Ton parcours d'apprentissage</h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400/70 to-red-500/70 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Prévention Maladies Chroniques</span>
              </div>
              <span className="text-sm font-bold text-gray-700">70%</span>
            </div>
            <div className="h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-gradient-to-r from-red-400/80 to-red-500/80"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400/70 to-purple-500/70 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Santé Mentale & Bien-être</span>
              </div>
              <span className="text-sm font-bold text-gray-700">50%</span>
            </div>
            <div className="h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div className="h-full w-[50%] bg-gradient-to-r from-purple-400/80 to-purple-500/80"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400/70 to-emerald-500/70 rounded-lg flex items-center justify-center">
                  <Apple className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Nutrition Équilibrée</span>
              </div>
              <span className="text-sm font-bold text-gray-700">85%</span>
            </div>
            <div className="h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-gradient-to-r from-emerald-400/80 to-emerald-500/80"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
