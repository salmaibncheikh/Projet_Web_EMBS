"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MentalHealthReport } from "@/components/reports/mental-health-report"
import { NutritionReport } from "@/components/reports/nutrition-report"

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-amber-50/30 to-yellow-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/80 via-amber-500/80 to-yellow-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">Rapports</h1>
              <p className="text-white/90 mt-1 font-medium">Suivez votre progression au fil du temps</p>
            </div>
          </div>
          <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 gap-2 rounded-xl shadow-lg transition-all">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="mental" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/30 backdrop-blur-md rounded-2xl p-1.5 border border-orange-200/30">
          <TabsTrigger value="mental" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-200/60 data-[state=active]:to-amber-200/60 data-[state=active]:shadow-sm transition-all">
            Santé Mentale
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-200/60 data-[state=active]:to-amber-200/60 data-[state=active]:shadow-sm transition-all">
            Nutrition
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mental" className="space-y-4">
          <MentalHealthReport />
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <NutritionReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
