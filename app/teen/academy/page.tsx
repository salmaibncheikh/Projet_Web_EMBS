"use client"

import type React from "react"
import { useState } from "react"
import { 
  BookOpen, 
  Award,
  Target,
  Heart,
  Brain,
  Apple,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  XCircle,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Module {
  id: string
  title: string
  description: string
  progress: number
  icon: string
  color: string
  lessons: number
  completed: number
}

export default function HealthAcademyPage() {
  const [activeTab, setActiveTab] = useState<'learn' | 'myths' | 'ask'>('learn')
  const [mythQuestion, setMythQuestion] = useState('')
  const [askQuestion, setAskQuestion] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([])
  const [isLoadingResponse, setIsLoadingResponse] = useState(false)

  const modules: Module[] = [
    {
      id: '1',
      title: 'Prévention du Diabète',
      description: 'Comprendre les facteurs de risque et les stratégies de prévention',
      progress: 70,
      icon: '🩺',
      color: 'red',
      lessons: 8,
      completed: 6
    },
    {
      id: '2',
      title: 'Santé Mentale & Bien-être',
      description: 'Reconnaître les signes, gérer le stress et demander de l\'aide',
      progress: 50,
      icon: '🧠',
      color: 'purple',
      lessons: 10,
      completed: 5
    },
    {
      id: '3',
      title: 'Nutrition Équilibrée',
      description: 'Bases de l\'alimentation saine pour adolescents',
      progress: 85,
      icon: '🥗',
      color: 'green',
      lessons: 6,
      completed: 5
    },
    {
      id: '4',
      title: 'Hypertension & Cœur',
      description: 'Prévention des maladies cardiovasculaires',
      progress: 30,
      icon: '❤️',
      color: 'pink',
      lessons: 7,
      completed: 2
    },
    {
      id: '5',
      title: 'Santé Reproductive',
      description: 'Informations essentielles sur la puberté et la sexualité',
      progress: 60,
      icon: '🌸',
      color: 'rose',
      lessons: 9,
      completed: 5
    },
    {
      id: '6',
      title: 'Troubles Cognitifs',
      description: 'TDAH, dyslexie et autres troubles neurodéveloppementaux',
      progress: 40,
      icon: '🎯',
      color: 'blue',
      lessons: 8,
      completed: 3
    },
  ]

  const commonMyths = [
    {
      myth: "Les vaccins causent l'autisme",
      truth: "❌ FAUX - Des milliers d'études scientifiques ont prouvé qu'il n'y a aucun lien entre les vaccins et l'autisme.",
      category: "Vaccination"
    },
    {
      myth: "Le sucre rend hyperactif",
      truth: "❌ FAUX - Aucune étude scientifique ne confirme ce lien. L'hyperactivité après des bonbons vient souvent de l'excitation sociale.",
      category: "Nutrition"
    },
    {
      myth: "La dépression, c'est juste de la tristesse",
      truth: "❌ FAUX - La dépression est une maladie médicale qui affecte le cerveau et nécessite un traitement professionnel.",
      category: "Santé Mentale"
    },
    {
      myth: "Manger gras fait grossir",
      truth: "⚠️ NUANCÉ - Les bonnes graisses (avocat, noix, poisson) sont essentielles. Ce sont les excès caloriques qui font grossir.",
      category: "Nutrition"
    },
  ]

  const handleAskDoctor = async () => {
    if (!askQuestion.trim() || isLoadingResponse) return
    
    const userMessage = askQuestion
    setAskQuestion('')
    setIsLoadingResponse(true)
    
    // Add user message
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }])
    
    try {
      // Connect to RAG medical chatbot on port 5000
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: chatMessages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from medical AI')
      }

      const data = await response.json()
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.answer || 'Désolé, je n\'ai pas pu traiter ta question. Réessaie plus tard.'
      }])
    } catch (error) {
      console.error('Error connecting to RAG chatbot:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Impossible de se connecter au chatbot médical pour le moment. Vérifie que le serveur RAG est bien démarré (port 5000).'
      }])
    } finally {
      setIsLoadingResponse(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-amber-50/30 to-yellow-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/80 via-amber-500/80 to-yellow-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Académie Santé</h1>
            <p className="text-white/90 mt-1 font-medium">Combat la désinformation, deviens expert</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'learn'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-orange-50/50'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Apprendre
          </button>
          <button
            onClick={() => setActiveTab('myths')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'myths'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-orange-50/50'
            }`}
          >
            <XCircle className="w-5 h-5 inline mr-2" />
            Mythes & Réalités
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'ask'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-orange-50/50'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline mr-2" />
            Demande à l'IA
          </button>
        </div>
      </div>

      {/* Learning Modules Tab */}
      {activeTab === 'learn' && (
        <>
          {/* Progress Overview */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-800">Ton Parcours</h2>
              </div>
              <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                3 badges débloqués 🏆
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50/60 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Leçons terminées</p>
                <p className="text-3xl font-bold text-gray-800">26/58</p>
              </div>
              <div className="p-4 bg-amber-50/60 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Temps d'apprentissage</p>
                <p className="text-3xl font-bold text-gray-800">8h 45min</p>
              </div>
              <div className="p-4 bg-yellow-50/60 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Score moyen</p>
                <p className="text-3xl font-bold text-gray-800">92%</p>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => (
              <div key={module.id} className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${module.color}-400/70 to-${module.color}-500/70 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{module.completed}/{module.lessons} leçons</span>
                    <span className="font-bold text-gray-800">{module.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-${module.color}-400 to-${module.color}-500 transition-all`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>

                <Button className={`w-full bg-gradient-to-r from-${module.color}-400 to-${module.color}-500 text-white rounded-xl hover:scale-105 transition-transform`}>
                  {module.progress === 0 ? 'Commencer' : 'Continuer'}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Myths Tab */}
      {activeTab === 'myths' && (
        <>
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Démystifions la Santé</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Les réseaux sociaux sont pleins de fausses informations sur la santé. Apprends à distinguer le vrai du faux avec des faits scientifiques vérifiés.
            </p>

            <div className="mb-6">
              <Label className="text-gray-700 mb-2 block">Tu as vu quelque chose en ligne ? Vérifie-le ici :</Label>
              <div className="flex gap-2">
                <Input
                  value={mythQuestion}
                  onChange={(e) => setMythQuestion(e.target.value)}
                  placeholder="Ex: Est-ce que le lait donne de l'acné ?"
                  className="flex-1 border-orange-200/40 bg-white/60 rounded-xl"
                />
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl">
                  <Search className="w-4 h-4 mr-2" />
                  Vérifier
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {commonMyths.map((item, idx) => (
              <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">❓</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg mb-2">"{item.myth}"</p>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/40">
                  <p className="text-gray-800 font-medium">{item.truth}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Ask AI Tab */}
      {activeTab === 'ask' && (
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">Pose ta Question Santé</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Utilise notre IA médicale basée sur des sources scientifiques vérifiées. Toutes les réponses citent leurs sources.
          </p>

          {/* Chat Messages */}
          <div className="mb-4 space-y-3 max-h-96 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Pose ta première question sur la santé !</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-orange-400/80 to-amber-400/80 text-white'
                      : 'bg-white/60 border border-orange-200/40 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoadingResponse && (
              <div className="flex justify-start">
                <div className="bg-white/60 border border-orange-200/40 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">L'IA analyse ta question...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoadingResponse && handleAskDoctor()}
              placeholder="Ex: C'est quoi le TDAH ? Comment prévenir le diabète ?"
              className="flex-1 border-orange-200/40 bg-white/60 rounded-xl"
              disabled={isLoadingResponse}
            />
            <Button 
              onClick={handleAskDoctor}
              disabled={isLoadingResponse || !askQuestion.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl disabled:opacity-50"
            >
              {isLoadingResponse ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-orange-50/60 rounded-xl border border-orange-200/40 text-sm text-gray-700">
            💡 <strong>Note :</strong> Cette IA est informative uniquement. Pour un diagnostic ou traitement, consulte toujours un professionnel de santé.
          </div>
        </div>
      )}
    </div>
  )
}
