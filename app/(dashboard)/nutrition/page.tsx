"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, MessageCircle, TrendingUp, Apple, ChefHat, Sparkles, Users, Target, Flame } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { MealAnalyzer } from "@/components/nutrition/meal-analyzer"
import { NutritionDashboard } from "@/components/nutrition/dashboard-dynamic"
import { NutritionChatbot } from "@/components/nutrition/chatbot"

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("Bonne journée")

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Bonjour")
    else if (hour < 18) setGreeting("Bon après-midi")
    else setGreeting("Bonsoir")
  }, [])

  const features = [
    { icon: Apple, label: "Suivi calories", color: "emerald" },
    { icon: ChefHat, label: "Recettes IA", color: "green" },
    { icon: Users, label: "Famille", color: "teal" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-transparent to-green-50/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiMxMGJ5ODEiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzM0ZDN5OSIgc3RvcC1vcGFjaXR5PSIwLjAyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')]"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                  {greeting}, <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{user?.name || 'Utilisateur'}</span>
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Gérer votre nutrition n'a jamais été aussi simple
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${feature.color}-600`} />
                    <span className="text-xs font-medium text-gray-700 hidden md:inline">{feature.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-green-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Calories</span>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Aujourd'hui</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-100 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">1,450</p>
            <p className="text-sm text-gray-600">sur 2,000 objectif</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-teal-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repas</span>
                <div className="flex items-center gap-2 mt-1">
                  <Apple className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Suivis</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">🥗</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">8</p>
            <p className="text-sm text-gray-600">Cette semaine</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100/50 to-emerald-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progrès</span>
                <div className="flex items-center gap-2 mt-1">
                  <Target className="w-4 h-4 text-teal-500" />
                  <span className="text-xs text-teal-600 font-medium">Objectifs</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600 mb-1">+18%</p>
            <p className="text-sm text-gray-600">Ce mois-ci</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-lg h-24">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-green-100 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger 
            value="meal" 
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-green-100 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
          >
            <Camera className="w-5 h-5" />
            <span>Analyse Repas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chatbot" 
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-green-100 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Assistant Recettes</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab Content */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Nutritionnel</h2>
                <p className="text-sm text-gray-600">Suivez votre progression et vos objectifs nutritionnels</p>
              </div>
            </div>
            
            {/* Nutrition Dashboard Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <NutritionDashboard />
            </div>
          </div>
        </TabsContent>

        {/* Meal Analysis Tab Content */}
        <TabsContent value="meal" className="mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analyse de Repas par Photo</h2>
                <p className="text-sm text-gray-600">Prenez une photo de votre repas pour une analyse nutritionnelle détaillée</p>
              </div>
            </div>
            
            {/* Meal Analyzer Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <MealAnalyzer />
            </div>
          </div>
        </TabsContent>

        {/* Chatbot Tab Content */}
        <TabsContent value="chatbot" className="mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Assistant Recettes Personnalisées</h2>
                <p className="text-sm text-gray-600">Obtenez des recettes équilibrées adaptées aux besoins nutritionnels de votre famille</p>
              </div>
            </div>
            
            {/* Nutrition Chatbot Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <NutritionChatbot />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl border border-emerald-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Conseil du jour</h3>
              <p className="text-xs text-gray-500">Nutrition équilibrée</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Essayez d'inclure une source de protéines à chaque repas pour maintenir
            un niveau d'énergie stable tout au long de la journée.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50/50 to-white rounded-2xl border border-green-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Apple className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Objectif Hebdomadaire</h3>
              <p className="text-xs text-gray-500">À compléter</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">5 repas variés</span>
              <span className="text-sm font-semibold text-emerald-600">3/5</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}