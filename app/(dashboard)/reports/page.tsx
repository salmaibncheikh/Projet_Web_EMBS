"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, BarChart3, Sparkles, Calendar, Target, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { MentalHealthReport } from "@/components/reports/mental-health-report"
import { NutritionReport } from "@/components/reports/nutrition-report"

export default function ReportsPage() {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("Bonne journée")
  const [activeTab, setActiveTab] = useState("mental")

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Bonjour")
    else if (hour < 18) setGreeting("Bon après-midi")
    else setGreeting("Bonsoir")
  }, [])

  const features = [
    { icon: TrendingUp, label: "Analytique", color: "orange" },
    { icon: BarChart3, label: "Graphiques", color: "amber" },
    { icon: Target, label: "Objectifs", color: "yellow" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-transparent to-amber-50/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiNmOTczMDYiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZiOTIzMyIgc3RvcC1vcGFjaXR5PSIwLjAyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')]"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                  {greeting}, <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{user?.name || 'Utilisateur'}</span>
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Analysez votre progression et vos résultats détaillés
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              <Button className="bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white gap-2 rounded-xl shadow-sm hover:shadow-md transition-all px-4 py-2 h-auto">
                <Download className="w-4 h-4" />
                <span>Exporter PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-amber-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rapports</span>
                <div className="flex items-center gap-2 mt-1">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Générés</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-100 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">24</p>
            <p className="text-sm text-gray-600">Cette semaine</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-yellow-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analyses</span>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">Complétées</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">48</p>
            <p className="text-sm text-gray-600">Données analysées</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100/50 to-orange-100/50 rounded-bl-full transition-all duration-500 group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amélioration</span>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-yellow-600 font-medium">Tendance</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600 mb-1">+22%</p>
            <p className="text-sm text-gray-600">Ce mois-ci</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-lg h-24">
          <TabsTrigger 
            value="mental" 
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-100 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
          >
            <Activity className="w-5 h-5" />
            <span>Santé Mentale</span>
          </TabsTrigger>
          <TabsTrigger 
            value="nutrition" 
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-100 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Nutrition</span>
          </TabsTrigger>
        </TabsList>

        {/* Mental Health Reports */}
        <TabsContent value="mental" className="mt-6 animate-in fade-in-50 duration-200">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rapports Santé Mentale</h2>
                <p className="text-sm text-gray-600">Analysez vos progrès émotionnels et vos sessions de chatbot</p>
              </div>
            </div>
            
            {/* Mental Health Report Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <MentalHealthReport />
            </div>
          </div>
        </TabsContent>

        {/* Nutrition Reports */}
        <TabsContent value="nutrition" className="mt-6 animate-in fade-in-50 duration-200">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rapports Nutritionnels</h2>
                <p className="text-sm text-gray-600">Suivez vos habitudes alimentaires et vos progrès nutritionnels</p>
              </div>
            </div>
            
            {/* Nutrition Report Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <NutritionReport />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-orange-50/50 to-white rounded-2xl border border-orange-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Conseil de suivi</h3>
              <p className="text-xs text-gray-500">Fréquence optimale</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Consultez vos rapports hebdomadaires pour identifier les tendances et ajustez vos objectifs 
            en fonction des progrès observés.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50/50 to-white rounded-2xl border border-amber-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Exportation des données</h3>
              <p className="text-xs text-gray-500">Partage avec professionnels</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Exportez vos rapports en PDF pour les partager avec votre médecin ou les archiver dans votre dossier médical.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="rounded-lg">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg">
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}