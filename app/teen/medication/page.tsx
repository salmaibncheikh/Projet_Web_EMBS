"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { 
  Pill, 
  Clock,
  Calendar,
  Plus,
  Bell,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Award,
  Repeat
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string[]
  color: string
  taken: boolean
  nextDose: string
}

interface MedicationHistory {
  id: string
  medicationName: string
  time: string
  date: string
  status: 'taken' | 'missed' | 'skipped'
}

export default function TeenMedicationPage() {
  const { user } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    time: '09:00'
  })

  useEffect(() => {
    if (user?.email) {
      fetchMedications()
    }
  }, [user])

  const fetchMedications = async () => {
    try {
      const response = await fetch(`/api/health/medications?userId=${user?.email}&active=true`)
      if (response.ok) {
        const { medications: meds } = await response.json()
        setMedications(meds.map((m: any) => ({
          id: m._id,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          time: m.times,
          color: 'purple',
          taken: false,
          nextDose: m.times[0]
        })))
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMedication = async () => {
    if (!newMed.name || !newMed.dosage || !user?.email) return
    
    try {
      const response = await fetch('/api/health/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          name: newMed.name,
          dosage: newMed.dosage,
          frequency: newMed.frequency,
          times: [newMed.time],
          reminderEnabled: true
        })
      })

      if (response.ok) {
        await fetchMedications()
        setNewMed({ name: '', dosage: '', frequency: 'daily', time: '09:00' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding medication:', error)
      alert('Erreur lors de l\'ajout du médicament')
    }
  }

  const handleDeleteMedication = async (medId: string) => {
    if (!confirm('Supprimer ce médicament ?')) return
    
    try {
      const response = await fetch(`/api/health/medications?id=${medId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMedications()
      }
    } catch (error) {
      console.error('Error deleting medication:', error)
    }
  }

  const handleMarkAsTaken = async (medId: string) => {
    setMedications(medications.map(med => 
      med.id === medId ? { ...med, taken: true } : med
    ))
    
    // Update adherence in database
    try {
      await fetch('/api/health/medications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: medId,
          'adherence.taken': 1
        })
      })

      // Log medication activity
      if (user?.id) {
        await fetch('/api/teen/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            activityType: 'medication_taken',
            metadata: { medicationId: medId }
          })
        })
      }
    } catch (error) {
      console.error('Error updating adherence:', error)
    }
  }

  const adherenceRate = medications.length > 0 ? 95 : 0
  const streak = 7

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-blue-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/80 via-pink-500/80 to-blue-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <span className="text-4xl">💊</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Médicaments</h1>
            <p className="text-white/90 mt-1 font-medium">Suis ton traitement, prends soin de toi</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400/70 to-emerald-500/70 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600">Observance</span>
          </div>
          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-800">{adherenceRate}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Ce mois-ci</p>
          </div>
          <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400/70 to-red-500/70 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600">Série</span>
          </div>
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">{streak}</span>
              <span className="text-lg">🔥</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Jours consécutifs</p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400/70 to-pink-500/70 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600">Actifs</span>
          </div>
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">{medications.length}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Médicaments</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today" className="space-y-6">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-2">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger value="today" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
              <Clock className="w-4 h-4 mr-2" />
              Aujourd'hui
            </TabsTrigger>
            <TabsTrigger value="list" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
              <Pill className="w-4 h-4 mr-2" />
              Mes médicaments
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Historique
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-4">
          {/* Pending Medications */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              À prendre maintenant
            </h3>

            <div className="space-y-3">
              {medications.filter(med => !med.taken).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-semibold">Tous les médicaments pris !</p>
                  <p className="text-sm mt-1">Bravo, continue comme ça 🎉</p>
                </div>
              ) : (
                medications.filter(med => !med.taken).map((med) => (
                  <div key={med.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-purple-200/30">
                    <div className={`w-14 h-14 bg-gradient-to-br from-${med.color}-400/20 to-${med.color}-500/20 rounded-xl flex items-center justify-center`}>
                      <Pill className={`w-7 h-7 text-${med.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{med.name}</h4>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Prévu à {med.nextDose}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleMarkAsTaken(med.id)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Pris
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Taken Medications */}
          {medications.filter(med => med.taken).length > 0 && (
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Déjà pris
              </h3>

              <div className="space-y-3">
                {medications.filter(med => med.taken).map((med) => (
                  <div key={med.id} className="flex items-center gap-4 p-4 bg-green-50/60 rounded-xl border border-green-200/30 opacity-60">
                    <div className="w-14 h-14 bg-green-400/20 rounded-xl flex items-center justify-center">
                      <Pill className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{med.name}</h4>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                    </div>
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminder Settings */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 mb-2">Rappels activés</p>
                <p className="text-sm text-gray-700 mb-3">
                  Tu recevras une notification 15 minutes avant chaque prise. Tu peux personnaliser les horaires dans tes paramètres.
                </p>
                <Button variant="outline" className="rounded-xl">
                  <Bell className="w-4 h-4 mr-2" />
                  Gérer les notifications
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Medications List Tab */}
        <TabsContent value="list" className="space-y-4">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Mes médicaments</h3>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
              <div className="mb-6 p-4 bg-purple-50/60 rounded-xl border border-purple-200/40 space-y-4">
                <div>
                  <Label htmlFor="medName">Nom du médicament</Label>
                  <Input id="medName" placeholder="Ex: Vitamine C" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input id="dosage" placeholder="Ex: 500mg" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Fréquence</Label>
                    <select id="frequency" className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300">
                      <option>Tous les jours</option>
                      <option>2 fois par jour</option>
                      <option>3 fois par jour</option>
                      <option>Chaque semaine</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Heure(s) de prise</Label>
                  <Input type="time" className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="rounded-xl">
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* Medications List */}
            <div className="space-y-3">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-purple-200/30">
                  <div className={`w-14 h-14 bg-gradient-to-br from-${med.color}-400/20 to-${med.color}-500/20 rounded-xl flex items-center justify-center`}>
                    <Pill className={`w-7 h-7 text-${med.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{med.name}</h4>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {med.frequency === 'daily' ? 'Quotidien' : med.frequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {med.time.join(', ')}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Modifier
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Historique des prises</h3>

            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-white/60 rounded-xl border border-purple-200/30">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'taken' ? 'bg-green-100' : 
                    item.status === 'missed' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {item.status === 'taken' ? <Check className="w-4 h-4 text-green-600" /> :
                     item.status === 'missed' ? <X className="w-4 h-4 text-red-600" /> :
                     <Clock className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.medicationName}</p>
                    <p className="text-xs text-gray-500">{item.date} à {item.time}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                    item.status === 'taken' ? 'bg-green-100 text-green-700' :
                    item.status === 'missed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status === 'taken' ? 'Pris' : 
                     item.status === 'missed' ? 'Oublié' : 'Sauté'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Cette semaine</h3>
            <div className="grid grid-cols-7 gap-2">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-xs text-gray-600 mb-2">{day}</p>
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center ${
                    idx < 5 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {idx < 5 ? <Check className="w-4 h-4 text-green-600" /> : 
                     <span className="text-xs text-gray-400">-</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
