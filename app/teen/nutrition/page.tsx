"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { 
  Apple, 
  Camera,
  TrendingUp,
  Target,
  Flame,
  Droplets,
  Zap,
  Award,
  Upload,
  ChefHat,
  AlertCircle,
  MessageSquare,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import Link from "next/link"

// Nutritionist Chatbot Component
function NutritionistChatbot() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input
    setInput('')
    setIsLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('http://localhost:9000/api/nutrition/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          conversationHistory: messages
        })
      })

      if (!response.ok) throw new Error('Failed to get nutritionist response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Impossible de contacter le nutritionniste (port 9000). Vérifie que le serveur est démarré.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm p-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ChefHat className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="font-bold text-gray-800 text-xl mb-2">Nutritionniste IA</h3>
        <p className="text-gray-600">Pose tes questions sur l'alimentation et reçois des conseils personnalisés</p>
      </div>

      {/* Chat Messages */}
      <div className="mb-4 space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Pose ta première question nutritionnelle !</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-green-400/80 to-emerald-400/80 text-white'
                  : 'bg-white/60 border border-green-200/40 text-gray-800'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/60 border border-green-200/40 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-600">Le nutritionniste réfléchit...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-semibold text-gray-800">Questions populaires :</p>
          {[
            "Comment prendre du muscle en tant qu'ado ?",
            "Quels aliments avant le sport ?",
            "Est-ce que sauter le petit-déj est grave ?",
            "Comment manger équilibré avec un petit budget ?",
          ].map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestion(question)}
              className="w-full text-left p-3 bg-white/60 hover:bg-green-50/60 rounded-xl border border-green-200/30 text-sm text-gray-700 transition-all"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="Ex: Comment équilibrer mes repas ?"
          className="flex-1 border-green-200/40 bg-white/60 rounded-xl"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl disabled:opacity-50"
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}

interface Meal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  image?: string
}

export default function TeenNutritionPage() {
  const { user } = useAuth()
  const [meals, setMeals] = useState<Meal[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  // Calculate totals from meals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const dailyGoals = {
    calories: { current: Math.round(totals.calories), target: 2200, unit: 'kcal', icon: Flame, color: 'orange' },
    protein: { current: Math.round(totals.protein), target: 70, unit: 'g', icon: Zap, color: 'blue' },
    carbs: { current: Math.round(totals.carbs), target: 275, unit: 'g', icon: Apple, color: 'green' },
    water: { current: 1.8, target: 2.5, unit: 'L', icon: Droplets, color: 'cyan' },
  }

  useEffect(() => {
    if (user?.id) {
      fetchMeals()
    }
  }, [user])

  const fetchMeals = async () => {
    try {
      const response = await fetch(`/api/teen/meals?userId=${user?.id}&days=1`)
      if (response.ok) {
        const data = await response.json()
        setMeals(data.meals || [])
      }
    } catch (error) {
      console.error('Error fetching meals:', error)
    }
  }

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setScanResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('portion_g', '200')
      formData.append('k', '3')

      const response = await fetch('http://localhost:8000/api/food', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to classify food')
      }

      const data = await response.json()
      setScanResult(data)

      // Add meal to list
      const now = new Date()
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      const newMeal: Meal = {
        id: Date.now().toString(),
        name: data.best_label.replace(/_/g, ' '),
        calories: Math.round(data.nutrition_per_portion?.calories || 0),
        protein: data.nutrition_per_portion?.protein_g || 0,
        carbs: data.nutrition_per_portion?.carbs_g || 0,
        fat: data.nutrition_per_portion?.fat_g || 0,
        time: timeStr,
      }

      // Save meal to database
      if (user?.id) {
        const saveMealResponse = await fetch('/api/teen/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            name: newMeal.name,
            calories: newMeal.calories,
            protein: newMeal.protein,
            carbs: newMeal.carbs,
            fat: newMeal.fat,
            time: newMeal.time
          })
        })

        if (saveMealResponse.ok) {
          // Log meal scan activity
          await fetch('/api/teen/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              activityType: 'meal_scanned',
              metadata: { mealName: newMeal.name, calories: newMeal.calories }
            })
          })

          // Refresh meals from database
          await fetchMeals()
        }
      }
    } catch (error) {
      console.error('Error classifying food:', error)
      alert('⚠️ Impossible de se connecter au classificateur (port 8000). Vérifie que le serveur est démarré.')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500/80 via-emerald-500/80 to-teal-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🥗</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Nutrition</h1>
            <p className="text-white/90 mt-1 font-medium">Mange sainement, préviens les maladies</p>
          </div>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(dailyGoals).map(([key, goal]) => {
          const Icon = goal.icon
          const percentage = (goal.current / goal.target) * 100
          return (
            <div key={key} className="bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-${goal.color}-400/70 to-${goal.color}-500/70 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-600 capitalize">{key}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800">{goal.current}</span>
                  <span className="text-sm text-gray-600">/ {goal.target} {goal.unit}</span>
                </div>
              </div>
              <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-${goal.color}-400 to-${goal.color}-500 transition-all`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scanner" className="space-y-6">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm p-2">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger value="scanner" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl">
              <Camera className="w-4 h-4 mr-2" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="today" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl">
              <Apple className="w-4 h-4 mr-2" />
              Aujourd'hui
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl">
              <ChefHat className="w-4 h-4 mr-2" />
              Nutritionniste IA
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Scanner Tab */}
        <TabsContent value="scanner" className="space-y-6">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Scanne ton repas</h2>
              <p className="text-gray-600 mb-6">
                Prends une photo de ton assiette et notre IA identifiera les aliments et calculera les valeurs nutritionnelles.
              </p>
              
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleUploadImage}
                className="hidden"
                id="food-upload"
                disabled={isScanning}
              />
              <label htmlFor="food-upload">
                <Button 
                  as="span"
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-6 text-lg disabled:opacity-50 cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Prendre une photo
                    </>
                  )}
                </Button>
              </label>

              {scanResult && (
                <div className="mt-6 p-4 bg-green-50/60 rounded-xl border border-green-200/40">
                  <p className="font-semibold text-gray-800 mb-2">✅ Aliment détecté !</p>
                  <p className="text-lg font-bold text-green-700 mb-3">{scanResult.best_label.replace(/_/g, ' ')}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Calories:</span> <span className="font-semibold">{Math.round(scanResult.nutrition_per_portion?.calories || 0)} kcal</span></div>
                    <div><span className="text-gray-600">Protéines:</span> <span className="font-semibold">{scanResult.nutrition_per_portion?.protein_g || 0}g</span></div>
                    <div><span className="text-gray-600">Glucides:</span> <span className="font-semibold">{scanResult.nutrition_per_portion?.carbs_g || 0}g</span></div>
                    <div><span className="text-gray-600">Lipides:</span> <span className="font-semibold">{scanResult.nutrition_per_portion?.fat_g || 0}g</span></div>
                  </div>
                  {scanResult.topk && scanResult.topk.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-green-200/40">
                      <p className="text-xs text-gray-600 mb-1">Autres possibilités:</p>
                      {scanResult.topk.slice(1, 3).map((item: any, idx: number) => (
                        <p key={idx} className="text-xs text-gray-600">
                          • {item.label.replace(/_/g, ' ')} ({Math.round(item.score * 100)}%)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 p-4 bg-green-50/60 rounded-xl border border-green-200/40 text-left">
                <p className="text-sm font-semibold text-gray-800 mb-2">💡 Conseil pour la prévention du diabète :</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Limite les sucres rapides (sodas, bonbons)</li>
                  <li>✓ Privilégie les céréales complètes</li>
                  <li>✓ Mange des légumes à chaque repas</li>
                  <li>✓ Évite de sauter le petit-déjeuner</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Tes progrès cette semaine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50/60 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Repas équilibrés</p>
                <p className="text-3xl font-bold text-green-600">18/21</p>
                <p className="text-xs text-gray-600 mt-1">Super ! 86%</p>
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Fruits & Légumes</p>
                <p className="text-3xl font-bold text-emerald-600">32</p>
                <p className="text-xs text-gray-600 mt-1">portions cette semaine</p>
              </div>
              <div className="p-4 bg-teal-50/60 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Hydratation</p>
                <p className="text-3xl font-bold text-teal-600">95%</p>
                <p className="text-xs text-gray-600 mt-1">objectif atteint</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Today's Meals Tab */}
        <TabsContent value="today" className="space-y-4">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Repas du jour</h3>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl">
                <Camera className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-green-200/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl flex items-center justify-center">
                    <Apple className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{meal.name}</h4>
                    <p className="text-sm text-gray-600">{meal.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{meal.calories} kcal</p>
                    <p className="text-xs text-gray-600">
                      P: {meal.protein}g • G: {meal.carbs}g • L: {meal.fat}g
                    </p>
                  </div>
                </div>
              ))}

              {meals.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Apple className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun repas enregistré aujourd'hui</p>
                  <p className="text-sm mt-1">Commence par scanner ton premier repas !</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Analysis */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 mb-2">Analyse du jour</p>
                <p className="text-sm text-gray-700">
                  Tu as bien mangé aujourd'hui ! Pense à ajouter plus de protéines au dîner pour atteindre ton objectif de 70g. 
                  Un yaourt grec ou du poulet seraient parfaits. 💪
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Chatbot Tab */}
        <TabsContent value="chatbot" className="space-y-4">
          <NutritionistChatbot />
        </TabsContent>
      </Tabs>
    </div>
  )
}
