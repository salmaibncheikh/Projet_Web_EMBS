"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Upload, Sparkles, Brain, Heart, TrendingUp } from "lucide-react"
import { MentalHealthChatbot } from "@/components/mental-health/chatbot"
import { EmotionAnalyzer } from "@/components/mental-health/emotion-analyzer"

export default function MentalHealthPage() {
  const [activeTab, setActiveTab] = useState("chatbot")

  const features = [
    { icon: MessageCircle, label: "Chatbot IA", color: "purple" },
    { icon: Brain, label: "Analyse cognitive", color: "pink" },
    { icon: Heart, label: "Suivi émotionnel", color: "blue" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-pink-50/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiM4YjVhZmYiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2Q4YjJmZiIgc3RvcC1vcGFjaXR5PSIwLjAyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')]"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Santé Mentale</span>
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Explorez votre bien-être mental avec nos outils IA avancés
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</span>
                <div className="flex items-center gap-2 mt-1">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-purple-600 font-medium">Chatbot</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-100 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">💬</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">24</p>
            <p className="text-sm text-gray-600">Cette semaine</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100/50 to-rose-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analyses</span>
                <div className="flex items-center gap-2 mt-1">
                  <Upload className="w-4 h-4 text-pink-500" />
                  <span className="text-xs text-pink-600 font-medium">Dessins</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">12</p>
            <p className="text-sm text-gray-600">Dessins analysés</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progrès</span>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Amélioration</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-1">+15%</p>
            <p className="text-sm text-gray-600">Ce mois-ci</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-lg h-24">
          <TabsTrigger 
            value="chatbot" 
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-100 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chatbot IA</span>
          </TabsTrigger>
          <TabsTrigger 
            value="emotion" 
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-100 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
          >
            <Upload className="w-5 h-5" />
            <span>Analyse d'Émotions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chatbot" className="mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Assistant Santé Mentale</h2>
                <p className="text-sm text-gray-600">Discutez de votre bien-être mental ou de celui de votre enfant</p>
              </div>
            </div>
            
            {/* Chatbot Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <MentalHealthChatbot />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="emotion" className="mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analyse des Émotions par Dessin</h2>
                <p className="text-sm text-gray-600">Uploadez un dessin de votre enfant pour analyser ses émotions</p>
              </div>
            </div>
            
            {/* Emotion Analyzer Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <EmotionAnalyzer />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}