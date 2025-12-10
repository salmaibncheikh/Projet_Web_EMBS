"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, MessageCircle, TrendingUp } from "lucide-react"
import { MealAnalyzer } from "@/components/nutrition/meal-analyzer"
import { NutritionDashboard } from "@/components/nutrition/dashboard-dynamic"
import { NutritionChatbot } from "@/components/nutrition/chatbot"

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

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
            <p className="text-white/90 mt-1 font-medium">Suivez et optimisez l'alimentation de votre famille</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/30 backdrop-blur-md rounded-2xl p-1.5 border border-green-200/30">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-200/60 data-[state=active]:to-emerald-200/60 data-[state=active]:shadow-sm transition-all">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="meal" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-200/60 data-[state=active]:to-emerald-200/60 data-[state=active]:shadow-sm transition-all">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Repas</span>
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-200/60 data-[state=active]:to-emerald-200/60 data-[state=active]:shadow-sm transition-all">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Recettes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <NutritionDashboard />
        </TabsContent>

        <TabsContent value="meal" className="space-y-4">
          <div className="bg-green-50/30 backdrop-blur-sm rounded-2xl p-6 border border-green-200/30 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">📸</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Analyse de Repas</h3>
                <p className="text-gray-600 text-sm mt-1">Prenez une photo de votre repas pour analyser les calories et nutriments</p>
              </div>
            </div>
            <MealAnalyzer />
          </div>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <div className="bg-emerald-50/30 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/30 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">👨‍🍳</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Assistant Recettes</h3>
                <p className="text-gray-600 text-sm mt-1">Demandez des recettes équilibrées adaptées à votre famille</p>
              </div>
            </div>
            <NutritionChatbot />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
