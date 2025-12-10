"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { 
  Brain, 
  Heart,
  Smile,
  Meh,
  Frown,
  Angry,
  TrendingUp,
  Sparkles,
  Moon,
  Sun,
  Cloud,
  Zap,
  Target,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MoodEntry {
  _id?: string
  mood: number
  date: string
  notes?: string
}

export default function BrainHealthPage() {
  const { user } = useAuth()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [weekMoods, setWeekMoods] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const moods = [
    { level: 1, emoji: '😢', label: 'Très triste', color: 'from-gray-400 to-gray-500' },
    { level: 2, emoji: '😕', label: 'Pas bien', color: 'from-orange-400 to-orange-500' },
    { level: 3, emoji: '😐', label: 'Neutre', color: 'from-yellow-400 to-yellow-500' },
    { level: 4, emoji: '🙂', label: 'Bien', color: 'from-green-400 to-green-500' },
    { level: 5, emoji: '😄', label: 'Super !', color: 'from-blue-400 to-purple-500' },
  ]

  const [cognitiveScores, setCognitiveScores] = useState([
    { name: 'Mémoire', score: 0, icon: Brain, color: 'purple', type: 'memory' },
    { name: 'Attention', score: 0, icon: Target, color: 'blue', type: 'attention' },
    { name: 'Vitesse', score: 0, icon: Zap, color: 'yellow', type: 'processing_speed' },
    { name: 'Logique', score: 0, icon: Sparkles, color: 'pink', type: 'problem_solving' },
  ])

  useEffect(() => {
    if (user?.id) {
      fetchMoods()
      fetchBrainTests()
    }
  }, [user])

  const fetchMoods = async () => {
    try {
      const response = await fetch(`/api/health/moods?userId=${user?.email}&days=7`)
      if (response.ok) {
        const data = await response.json()
        setWeekMoods(data.moods || [])
      }
    } catch (error) {
      console.error('Error fetching moods:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBrainTests = async () => {
    try {
      const response = await fetch(`/api/teen/brain-tests?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        // Update scores with latest test results
        const updatedScores = cognitiveScores.map(score => {
          const testType = score.type
          const latestTest = data.tests.find((t: any) => t.testType === testType)
          return latestTest ? { ...score, score: latestTest.score } : score
        })
        setCognitiveScores(updatedScores)
      }
    } catch (error) {
      console.error('Error fetching brain tests:', error)
    }
  }

  const handleMoodSelect = async (level: number) => {
    if (!user?.email || isSaving) return
    
    setSelectedMood(level)
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/health/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          mood: level,
          notes: ''
        })
      })

      if (response.ok) {
        // Log mood activity
        await fetch('/api/teen/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            activityType: 'mood_logged'
          })
        })
        
        await fetchMoods()
        setTimeout(() => setSelectedMood(null), 2000)
      }
    } catch (error) {
      console.error('Error saving mood:', error)
      alert('Erreur lors de l\'enregistrement de l\'humeur')
    } finally {
      setIsSaving(false)
    }
  }

  const getMoodEmoji = (moodLevel: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😄']
    return emojis[moodLevel - 1] || '😐'
  }

  const getWeekdayMoods = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const today = new Date()
    const result = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]
      
      const moodForDay = weekMoods.find(m => {
        const moodDate = new Date(m.date)
        return moodDate.toDateString() === date.toDateString()
      })

      result.push({
        day: dayName,
        mood: moodForDay?.mood || 0,
        emoji: moodForDay ? getMoodEmoji(moodForDay.mood) : '⚪'
      })
    }

    return result
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-blue-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/80 via-pink-500/80 to-blue-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🧠</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Santé Mentale</h1>
            <p className="text-white/90 mt-1 font-medium">Surveillance cognitive & émotionnelle</p>
          </div>
        </div>
      </div>

      {/* Daily Mood Check */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Comment te sens-tu aujourd'hui ?</h2>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.level}
              onClick={() => handleMoodSelect(mood.level)}
              disabled={isSaving}
              className={`p-4 rounded-2xl border-2 transition-all ${
                selectedMood === mood.level
                  ? `bg-gradient-to-br ${mood.color} border-white scale-105 shadow-lg`
                  : 'bg-white/60 border-purple-200/40 hover:scale-105 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving && selectedMood === mood.level ? (
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              ) : (
                <div className="text-4xl mb-2">{mood.emoji}</div>
              )}
              <p className={`text-sm font-medium ${selectedMood === mood.level ? 'text-white' : 'text-gray-700'}`}>
                {mood.label}
              </p>
            </button>
          ))}
        </div>

        {selectedMood && !isSaving && (
          <div className="mt-4 p-4 bg-purple-50/60 rounded-xl border border-purple-200/40">
            <p className="text-sm text-gray-700">
              ✓ Humeur enregistrée ! Continue de suivre ton bien-être chaque jour.
            </p>
          </div>
        )}
      </div>

      {/* Mood Trends */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-pink-200/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-pink-600" />
            <h2 className="text-xl font-bold text-gray-800">Tendances cette semaine</h2>
          </div>
          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            Plutôt positif 👍
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-2 h-48">
            {getWeekdayMoods().map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-2xl">{day.emoji}</div>
                <div 
                  className={`w-full ${day.mood > 0 ? 'bg-gradient-to-t from-purple-400 to-pink-400' : 'bg-gray-200'} rounded-t-xl transition-all hover:scale-105`}
                  style={{ height: `${day.mood > 0 ? day.mood * 20 : 10}%` }}
                />
                <p className="text-xs font-medium text-gray-700">{day.day}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-pink-50/60 rounded-xl border border-pink-200/40">
          <p className="text-sm font-semibold text-gray-800 mb-2">📈 Analyse IA</p>
          <p className="text-sm text-gray-700">
            Ton humeur s'améliore progressivement depuis 2 semaines. Tu as eu une baisse jeudi, probablement liée au stress mentionné dans ton journal. Continue les activités qui te font du bien ! 💪
          </p>
        </div>
      </div>

      {/* Cognitive Performance */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Performance Cognitive</h2>
          </div>
          <Link href="/teen/cognitive-games">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl">
              <Sparkles className="w-4 h-4 mr-2" />
              Jouer
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cognitiveScores.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.name} className="bg-white/60 rounded-2xl p-4 border border-blue-200/30">
                <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-400/70 to-${item.color}-500/70 rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.name}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-800">{item.score}</span>
                  <span className="text-sm text-gray-600 mb-1">/100</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-500`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50/60 rounded-xl border border-blue-200/40">
          <p className="text-sm font-semibold text-gray-800 mb-2">🎯 Objectif de la semaine</p>
          <p className="text-sm text-gray-700 mb-3">
            Améliore ton score d'attention de 72 à 80 avec des exercices de concentration quotidiens.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200/50 rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-gradient-to-r from-blue-400 to-blue-500" />
            </div>
            <span className="text-xs font-medium text-gray-700">72/80</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400/70 to-purple-500/70 rounded-xl flex items-center justify-center mb-4">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Journal Intime</h3>
          <p className="text-sm text-gray-600">Écris tes pensées et émotions quotidiennes</p>
        </div>

        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400/70 to-blue-500/70 rounded-xl flex items-center justify-center mb-4">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Exercices de Respiration</h3>
          <p className="text-sm text-gray-600">5 minutes de relaxation guidée</p>
        </div>

        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-pink-200/30 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400/70 to-pink-500/70 rounded-xl flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Dessiner mes Émotions</h3>
          <p className="text-sm text-gray-600">Art-thérapie pour exprimer tes sentiments</p>
        </div>
      </div>

      {/* Mental Health Resources */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-red-200/30 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🆘 Ressources d'Urgence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/40">
            <p className="font-semibold text-gray-800 mb-1">Ligne d'écoute 24/7</p>
            <p className="text-2xl font-bold text-red-600">3114</p>
            <p className="text-xs text-gray-600 mt-1">Prévention suicide - Gratuit et anonyme</p>
          </div>
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/40">
            <p className="font-semibold text-gray-800 mb-1">Fil Santé Jeunes</p>
            <p className="text-2xl font-bold text-blue-600">0 800 235 236</p>
            <p className="text-xs text-gray-600 mt-1">Écoute, info santé - Anonyme</p>
          </div>
        </div>
      </div>
    </div>
  )
}
