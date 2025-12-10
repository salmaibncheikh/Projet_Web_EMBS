"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { teenApi, JournalEntry } from "@/lib/teen-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Book, Wind, Ghost } from "lucide-react"

export default function QuestsPage() {
  const { user } = useAuth()
  const [journalContent, setJournalContent] = useState("")
  const [moodTag, setMoodTag] = useState("")
  const [history, setHistory] = useState<JournalEntry[]>([])

  useEffect(() => {
    if (user?.id) {
        loadHistory(user.id)
    }
  }, [user])

  const loadHistory = async (userId: string) => {
      try {
          const entries = await teenApi.getJournal(userId)
          setHistory(entries.reverse())
      } catch (e) {
          console.error(e)
      }
  }

  const handleSaveJournal = async () => {
    if (!user?.id || !journalContent) return
    try {
        await teenApi.createJournal(user.id, journalContent, moodTag)
        setJournalContent("")
        setMoodTag("")
        loadHistory(user.id)
        alert("Journal sauvegardé ! Ton BloomPet est plus heureux.")
    } catch (e) {
        console.error(e)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Quêtes & Activités</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gratitude Journal */}
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-purple-500"/> Journal de Gratitude
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Note 3 choses positives aujourd'hui.</p>
                <Textarea 
                    placeholder="Aujourd'hui, je suis reconnaissant pour..." 
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    className="min-h-[100px]"
                />
                <Input 
                    placeholder="Humeur (ex: Joyeux, Calme)" 
                    value={moodTag}
                    onChange={(e) => setMoodTag(e.target.value)}
                />
                <Button onClick={handleSaveJournal} className="w-full">Sauvegarder</Button>
            </CardContent>
        </Card>

        {/* History */}
        <Card className="md:col-span-1 h-[400px]">
            <CardHeader>
                <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    {history.map((entry) => (
                        <div key={entry.id} className="mb-4 p-3 bg-slate-50 rounded-lg border">
                            <p className="text-sm text-slate-800">{entry.content}</p>
                            <div className="flex justify-between mt-2 text-xs text-slate-500">
                                <span>{entry.mood_tag && `#${entry.mood_tag}`}</span>
                                <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-center text-muted-foreground">Aucune entrée pour le moment.</p>}
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Other Activities (Placeholders) */}
        <Card className="bg-blue-50 border-blue-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Wind className="w-5 h-5"/> Breathing Game
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-blue-600 mb-4">Synchronise ta respiration pour calmer ton esprit.</p>
                <Button variant="secondary" className="w-full bg-blue-200 text-blue-800 hover:bg-blue-300">Commencer (Bientôt)</Button>
            </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Ghost className="w-5 h-5"/> Worry Dragon
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-orange-600 mb-4">Écris tes soucis et laisse le dragon les manger.</p>
                <Button variant="secondary" className="w-full bg-orange-200 text-orange-800 hover:bg-orange-300">Commencer (Bientôt)</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
