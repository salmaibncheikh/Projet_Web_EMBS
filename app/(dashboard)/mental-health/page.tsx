"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Upload } from "lucide-react"
import { MentalHealthChatbot } from "@/components/mental-health/chatbot"
import { EmotionAnalyzer } from "@/components/mental-health/emotion-analyzer"

export default function MentalHealthPage() {
  const [activeTab, setActiveTab] = useState("chatbot")

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
            <p className="text-white/90 mt-1 font-medium">Explorez votre bien-être mental avec nos outils IA avancés</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/30 backdrop-blur-md rounded-2xl p-1.5 border border-purple-200/30">
          <TabsTrigger value="chatbot" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-200/60 data-[state=active]:to-pink-200/60 data-[state=active]:shadow-sm transition-all">
            <MessageCircle className="w-4 h-4" />
            Chatbot IA
          </TabsTrigger>
          <TabsTrigger value="emotion" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-200/60 data-[state=active]:to-pink-200/60 data-[state=active]:shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            Analyse d'Émotions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chatbot" className="space-y-4">
          <div className="bg-purple-50/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/30 shadow-sm">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">Assistant Santé Mentale</h3>
              <p className="text-gray-600 text-sm mt-1">Discutez de votre bien-être mental ou de celui de votre enfant</p>
            </div>
            <MentalHealthChatbot />
          </div>
        </TabsContent>

        <TabsContent value="emotion" className="space-y-4">
          <div className="bg-pink-50/30 backdrop-blur-sm rounded-2xl p-6 border border-pink-200/30 shadow-sm">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">Analyse des Émotions par Dessin</h3>
              <p className="text-gray-600 text-sm mt-1">Uploadez un dessin de votre enfant pour analyser ses émotions</p>
            </div>
            <EmotionAnalyzer />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
