"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MentalHealthReport } from "@/components/reports/mental-health-report"
import { NutritionReport } from "@/components/reports/nutrition-report"

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground mt-2">Suivez votre progression au fil du temps</p>
        </div>
        <Button className="btn-primary gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mental">Mental Health</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
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
