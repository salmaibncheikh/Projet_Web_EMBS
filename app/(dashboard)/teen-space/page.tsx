"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { teenApi, Pet, UserProgress } from "@/lib/teen-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Heart, Smile, Zap, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function SanctuaryPage() {
  const { user } = useAuth()
  const [pet, setPet] = useState<Pet | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadData(user.id)
    }
  }, [user])

  const loadData = async (userId: string) => {
    try {
      await teenApi.initProfile(userId)
      const [petData, progressData] = await Promise.all([
        teenApi.getPet(userId),
        teenApi.getProgress(userId)
      ])
      setPet(petData)
      setProgress(progressData)
    } catch (error) {
      console.error("Failed to load sanctuary data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInteract = async (type: "feed" | "play" | "heal") => {
    if (!user?.id) return
    try {
      const updatedPet = await teenApi.interactPet(user.id, type)
      setPet(updatedPet)
      // Refresh progress to see XP gain
      const updatedProgress = await teenApi.getProgress(user.id)
      setProgress(updatedProgress)
    } catch (error) {
      console.error("Interaction failed", error)
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement du Sanctuaire...</div>

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mon Sanctuaire
          </h1>
          <p className="text-muted-foreground">Prends soin de ton BloomPet en prenant soin de toi.</p>
        </div>
        <div className="flex gap-4">
            <Link href="/teen-space/quests">
                <Button variant="outline">Quêtes & Journal</Button>
            </Link>
            <Link href="/teen-space/assessments">
                <Button variant="outline">Évaluations</Button>
            </Link>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Pet Display */}
        <Card className="md:col-span-2 border-none shadow-xl bg-gradient-to-b from-blue-50 to-purple-50 overflow-hidden relative min-h-[400px] flex flex-col justify-center items-center">
            <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Niveau {progress?.level}
                </div>
                <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    {progress?.xp} XP
                </div>
            </div>

            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="text-9xl mb-8"
            >
                {pet?.stage === 'egg' && '🥚'}
                {pet?.stage === 'baby' && '🐣'}
                {pet?.stage === 'child' && '🐥'}
                {pet?.stage === 'adult' && '🦅'}
            </motion.div>
            
            <h2 className="text-2xl font-bold text-slate-700 mb-2">{pet?.name}</h2>
            <p className="text-slate-500 capitalize">{pet?.stage}</p>
        </Card>

        {/* Stats & Actions */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>État de BloomPet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-red-500"/> Santé</span>
                            <span>{pet?.health}%</span>
                        </div>
                        <Progress value={pet?.health} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><Smile className="w-4 h-4 text-yellow-500"/> Bonheur</span>
                            <span>{pet?.happiness}%</span>
                        </div>
                        <Progress value={pet?.happiness} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3">
                    <Button onClick={() => handleInteract('feed')} className="w-full justify-start gap-2 bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
                        🍎 Nourrir (+Santé)
                    </Button>
                    <Button onClick={() => handleInteract('play')} className="w-full justify-start gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                        🎾 Jouer (+Bonheur)
                    </Button>
                    <Button onClick={() => handleInteract('heal')} className="w-full justify-start gap-2 bg-green-100 text-green-700 hover:bg-green-200 border-none">
                        💊 Soigner (+Santé)
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
