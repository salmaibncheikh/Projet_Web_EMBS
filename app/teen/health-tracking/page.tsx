"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Zap,
  Moon,
  Droplets,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Symptom {
  _id?: string
  id?: string
  type: string
  severity: number
  date: string
  notes?: string
  note?: string
}

export default function HealthTrackingPage() {
  const { user } = useAuth()
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSymptom, setNewSymptom] = useState({
    type: '',
    severity: 3,
    note: ''
  })

  const symptomTypes = [
    { name: 'Maux de tête', icon: '🤕', value: 'headache' },
    { name: 'Fatigue', icon: '😴', value: 'fatigue' },
    { name: 'Douleurs abdominales', icon: '🤒', value: 'abdominal_pain' },
    { name: 'Nausées', icon: '🤢', value: 'nausea' },
    { name: 'Vertiges', icon: '😵', value: 'dizziness' },
    { name: 'Douleurs musculaires', icon: '💪', value: 'muscle_pain' },
    { name: 'Autre', icon: '❓', value: 'other' },
  ]

  // Fetch symptoms on mount
  useEffect(() => {
    if (user?.email) {
      fetchSymptoms()
    }
  }, [user])

  const fetchSymptoms = async () => {
    try {
      const response = await fetch(`/api/health/symptoms?userId=${user?.email}&days=30`)
      if (response.ok) {
        const data = await response.json()
        setSymptoms(data.symptoms || [])
      }
    } catch (error) {
      console.error('Error fetching symptoms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSymptom = async () => {
    if (!newSymptom.type || !user?.email) return
    
    try {
      const response = await fetch('/api/health/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          type: newSymptom.type,
          severity: newSymptom.severity,
          notes: newSymptom.note
        })
      })

      if (response.ok) {
        // Log activity
        await fetch('/api/teen/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            activityType: 'symptom_logged'
          })
        })
        
        await fetchSymptoms()
        setNewSymptom({ type: '', severity: 3, note: '' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding symptom:', error)
      alert('Erreur lors de l\'ajout du symptôme')
    }
  }

  const handleDeleteSymptom = async (symptomId: string) => {
    try {
      const response = await fetch(`/api/health/symptoms?id=${symptomId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchSymptoms()
      }
    } catch (error) {
      console.error('Error deleting symptom:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    return `Il y a ${diffDays} jours`
  }

  const getSymptomLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      headache: 'Maux de tête',
      fatigue: 'Fatigue',
      abdominal_pain: 'Douleurs abdominales',
      nausea: 'Nausées',
      dizziness: 'Vertiges',
      muscle_pain: 'Douleurs musculaires',
      other: 'Autre'
    }
    return labels[type] || type
  }

  const handleAddSymptomOld = () => {
    if (!newSymptom.type) return
    
    const symptom: Symptom = {
      id: Date.now().toString(),
      type: newSymptom.type,
      severity: newSymptom.severity,
      date: new Date().toISOString(),
      note: newSymptom.note
    }
    
    setSymptoms([symptom, ...symptoms])
    setNewSymptom({ type: '', severity: 3, note: '' })
    setShowAddForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/40 via-orange-50/30 to-yellow-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500/80 via-orange-500/80 to-yellow-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🩺</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Suivi Santé</h1>
            <p className="text-white/90 mt-1 font-medium">Prévention des maladies chroniques</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-red-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-gray-800">72</span>
          </div>
          <p className="text-sm text-gray-600">BPM Repos</p>
          <p className="text-xs text-green-600 mt-1">Normal ✓</p>
        </div>

        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Thermometer className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-800">36.7°C</span>
          </div>
          <p className="text-sm text-gray-600">Température</p>
          <p className="text-xs text-green-600 mt-1">Normal ✓</p>
        </div>

        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Moon className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800">7.5h</span>
          </div>
          <p className="text-sm text-gray-600">Sommeil moy.</p>
          <p className="text-xs text-green-600 mt-1">Bon ✓</p>
        </div>

        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-cyan-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Droplets className="w-8 h-8 text-cyan-500" />
            <span className="text-2xl font-bold text-gray-800">1.8L</span>
          </div>
          <p className="text-sm text-gray-600">Eau/jour</p>
          <p className="text-xs text-yellow-600 mt-1">Augmenter ⚠</p>
        </div>
      </div>

      {/* Symptom Tracking */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-red-200/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-800">Historique des symptômes</h2>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Add Symptom Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-red-50/60 rounded-xl border border-red-200/40">
            <h3 className="font-semibold text-gray-800 mb-4">Nouveau symptôme</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700">Type de symptôme</Label>
                <select
                  value={newSymptom.type}
                  onChange={(e) => setNewSymptom({...newSymptom, type: e.target.value})}
                  className="w-full mt-1 p-2 border border-red-200/40 rounded-xl bg-white/60 focus:ring-2 focus:ring-red-400/50"
                >
                  <option value="">Sélectionner...</option>
                  {symptomTypes.map(st => (
                    <option key={st.value} value={st.value}>{st.icon} {st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-gray-700">Sévérité (1-5)</Label>
                <div className="flex gap-2 mt-2">
                  {[1,2,3,4,5].map(level => (
                    <button
                      key={level}
                      onClick={() => setNewSymptom({...newSymptom, severity: level})}
                      className={`w-12 h-12 rounded-xl font-bold transition-all ${
                        newSymptom.severity === level
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white scale-110'
                          : 'bg-white/60 text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-700">Note (optionnel)</Label>
                <Input
                  value={newSymptom.note}
                  onChange={(e) => setNewSymptom({...newSymptom, note: e.target.value})}
                  placeholder="Contexte, déclencheur..."
                  className="border-red-200/40 bg-white/60 focus:ring-2 focus:ring-red-400/50 rounded-xl"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddSymptom} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl">
                  Enregistrer
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1 rounded-xl">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Symptom List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p>Chargement des symptômes...</p>
            </div>
          ) : symptoms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun symptôme enregistré</p>
              <p className="text-sm mt-1">Commence par ajouter ton premier symptôme</p>
            </div>
          ) : (
            symptoms.map(symptom => (
              <div key={symptom._id || symptom.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-red-200/30 hover:shadow-md transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{getSymptomLabel(symptom.type)}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < symptom.severity ? 'bg-red-500' : 'bg-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(symptom.date)}</p>
                  {(symptom.notes || symptom.note) && (
                    <p className="text-sm text-gray-700 mt-1 italic">"{symptom.notes || symptom.note}"</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteSymptom(symptom._id || symptom.id || '')}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 hover:bg-red-50 rounded-lg transition-all"
                >
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-800">Analyses & Recommandations</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50/60 rounded-xl border border-yellow-200/40">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 mb-1">Tendance détectée : Maux de tête récurrents</p>
                <p className="text-sm text-gray-700">3 épisodes cette semaine, principalement l'après-midi après les repas.</p>
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-800">💡 Recommandations :</p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• Augmente ta consommation d'eau (objectif: 2L/jour)</li>
                    <li>• Évite les écrans 30 min après le repas</li>
                    <li>• Fais des pauses visuelles toutes les heures</li>
                    <li>• Consulte un médecin si ça persiste plus de 2 semaines</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50/60 rounded-xl border border-green-200/40">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 mb-1">Progrès positif : Sommeil</p>
                <p className="text-sm text-gray-700">Ton sommeil s'est amélioré de 45 minutes en moyenne cette semaine. Continue comme ça ! 🎉</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/40">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 mb-1">Rappel : Antécédents familiaux</p>
                <p className="text-sm text-gray-700 mb-2">Diabète dans la famille → Prévention active recommandée</p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>✓ Activité physique régulière</li>
                  <li>✓ Alimentation équilibrée (limite sucres rapides)</li>
                  <li>⏳ Dépistage annuel recommandé dès 18 ans</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
