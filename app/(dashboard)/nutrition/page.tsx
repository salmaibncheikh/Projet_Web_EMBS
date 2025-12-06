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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nutrition</h1>
        <p className="text-muted-foreground mt-2">Suivez et optimisez l'alimentation de votre famille</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="meal" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Repas</span>
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Recettes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <NutritionDashboard />
        </TabsContent>

        <TabsContent value="meal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de Repas</CardTitle>
              <CardDescription>
                Prenez une photo de votre repas pour analyser les calories et nutriments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MealAnalyzer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assistant Recettes</CardTitle>
              <CardDescription>Demandez des recettes équilibrées adaptées à votre famille</CardDescription>
            </CardHeader>
            <CardContent>
              <NutritionChatbot />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
