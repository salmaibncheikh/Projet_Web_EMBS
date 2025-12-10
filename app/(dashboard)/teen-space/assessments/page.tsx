"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { teenApi } from "@/lib/teen-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Activity, Battery, Sparkles } from "lucide-react"

export default function AssessmentsPage() {
  const { user } = useAuth()
  
  const [moodScore, setMoodScore] = useState([5])
  const [energyScore, setEnergyScore] = useState([5])
  const [sparkleScore, setSparkleScore] = useState([5])

  const handleSubmit = async (type: "mood" | "energy" | "sparkle", score: number) => {
      if (!user?.id) return
      try {
          await teenApi.submitAssessment(user.id, type, score)
          alert("Évaluation enregistrée ! +20 XP")
      } catch (e) {
          console.error(e)
      }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Évaluations Bien-être</h1>
      <p className="text-muted-foreground">Des outils simples pour suivre ton état d'esprit.</p>

      <div className="grid gap-6">
        {/* Mood Check */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500"/> Mood Patterns
                </CardTitle>
                <CardDescription>Comment te sens-tu globalement aujourd'hui ? (0 = Triste, 10 = Joyeux)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-8">{moodScore[0]}</span>
                    <Slider value={moodScore} onValueChange={setMoodScore} max={10} step={1} className="flex-1" />
                </div>
                <Button onClick={() => handleSubmit('mood', moodScore[0])}>Enregistrer</Button>
            </CardContent>
        </Card>

        {/* Energy Meter */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-green-500"/> Energy Meter
                </CardTitle>
                <CardDescription>Quel est ton niveau d'énergie ? (0 = Épuisé, 10 = Pleine forme)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-8">{energyScore[0]}</span>
                    <Slider value={energyScore} onValueChange={setEnergyScore} max={10} step={1} className="flex-1" />
                </div>
                <Button onClick={() => handleSubmit('energy', energyScore[0])}>Enregistrer</Button>
            </CardContent>
        </Card>

        {/* Sparkle Check */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500"/> Sparkle Check
                </CardTitle>
                <CardDescription>À quel point te sens-tu motivé(e) ? (0 = Bof, 10 = Prêt à tout)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-8">{sparkleScore[0]}</span>
                    <Slider value={sparkleScore} onValueChange={setSparkleScore} max={10} step={1} className="flex-1" />
                </div>
                <Button onClick={() => handleSubmit('sparkle', sparkleScore[0])}>Enregistrer</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
