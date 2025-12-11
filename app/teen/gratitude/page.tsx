"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Heart, TrendingUp, BookOpen, CheckCircle2, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

export default function GratitudePage() {
  const [isCompleted, setIsCompleted] = useState(false)
  const [entries, setEntries] = useState<string[]>(['', '', ''])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [encouragement, setEncouragement] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  const prompts = [
    "Qu'est-ce qui t'a fait sourire aujourd'hui ?",
    "Pour qui es-tu reconnaissant(e) aujourd'hui ?",
    "À quoi tu te réjouis dans les jours à venir ?",
  ] as const

  const encouragements = [
    'Bravo ! Ta gratitude illumine ta journée ! ✨',
    "Tu cultives un état d'esprit positif - continue comme ça ! 🌱",
    'Que ces bonnes ondes continuent de circuler ! 💫',
    "Ta reconnaissance est un super pouvoir pour ta santé mentale ! 🦸‍♀️",
    "Chaque pensée positive est une graine de bonheur plantée ! 🌻"
  ]

  // Progress indicators for the stepper
  const progressSteps = [
    { icon: '😊', label: 'Sourire du jour' },
    { icon: '❤️', label: 'Reconnaissance' },
    { icon: '⭐', label: 'Anticipation' }
  ]

  const handleChange = (value: string) => {
    const newEntries = [...entries]
    newEntries[currentIndex] = value
    setEntries(newEntries)
  }

  const handleNext = () => {
    if (currentIndex < prompts.length - 1) {
      // Move to next step
      setCurrentIndex(currentIndex + 1)
    } else {
      // Complete all steps
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
      setEncouragement(randomEncouragement)
      setShowEncouragement(true)
      setShowConfetti(true)
      setIsCompleted(true)
      
      // Show celebration for 2 seconds then complete
      setTimeout(() => {
        setShowEncouragement(false)
        setShowConfetti(false)
      }, 2000)
    }
  }

  // Add subtle confetti effect
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/20 p-4 md:p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/teen">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Home className="w-4 h-4" />
              Accueil
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                Journal de Gratitude
              </span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Prends 5 minutes chaque jour pour cultiver la gratitude et améliorer ton bien-être mental
            </p>
          </div>

          {/* Confetti Celebration */}
          {showConfetti && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="text-center space-y-4 animate-in zoom-in duration-500">
                <div className="text-6xl">🎉</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
                  Journal Complété !
                </div>
              </div>
            </div>
          )}

          {/* Journal Card */}
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-2xl">
            {/* Decorative gradient corner */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-100/40 to-yellow-100/40 rounded-bl-full"></div>
            
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                      Journal de Gratitude
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Cultive la positivité jour après jour
                    </CardDescription>
                  </div>
                </div>
                
                {/* Progress Badge */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-full border border-pink-200">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx <= currentIndex ? 'bg-pink-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-pink-700 ml-2">
                    Étape {currentIndex + 1}/3
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6">
              {/* Encouragement Message */}
              {showEncouragement && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-emerald-200 shadow-sm animate-in slide-in-from-top duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-emerald-800">{encouragement}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Stepper */}
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  {progressSteps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300
                        ${idx === currentIndex 
                          ? 'bg-gradient-to-br from-pink-400 to-yellow-400 shadow-lg scale-110' 
                          : idx < currentIndex
                          ? 'bg-gradient-to-br from-pink-100 to-yellow-100 border-2 border-pink-200'
                          : 'bg-gray-100 text-gray-400'
                        }
                      `}>
                        {step.icon}
                      </div>
                      <span className={`
                        text-xs font-medium transition-all duration-300
                        ${idx === currentIndex 
                          ? 'text-pink-700' 
                          : idx < currentIndex
                          ? 'text-gray-700'
                          : 'text-gray-400'
                        }
                      `}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 via-pink-300 to-yellow-400 transition-all duration-500"
                    style={{ width: `${(currentIndex / (prompts.length - 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Prompt */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {prompts[currentIndex]}
                  </h3>
                </div>
                
                <Textarea
                  value={entries[currentIndex]}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Écris tes pensées ici..."
                  className="min-h-48 bg-white border border-gray-300 rounded-2xl p-4 text-gray-800 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all text-lg resize-none"
                  rows={6}
                />
                
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Chaque mot compte pour ton bien-être mental</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="relative z-10 flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  <span>3 minutes par jour pour cultiver ta gratitude</span>
                </div>
              </div>
              
              <Button
                onClick={handleNext}
                disabled={!entries[currentIndex].trim()}
                className="bg-gradient-to-r from-pink-400 to-yellow-400 hover:from-pink-500 hover:to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl px-8 py-2 h-auto transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {currentIndex < prompts.length - 1 ? 'Continuer' : 'Terminer'}
                  </span>
                  {currentIndex < prompts.length - 1 ? (
                    <span className="text-lg">→</span>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </Button>
            </CardFooter>
          </Card>

          {/* Completion Message */}
          {isCompleted && !showConfetti && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-emerald-200 p-6 shadow-lg animate-in slide-in-from-top duration-500">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">🎉</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">
                    Super travail !
                  </h3>
                  <p className="text-emerald-700">
                    Tu as complété ton journal de gratitude pour aujourd'hui. Continue cette pratique quotidienne pour renforcer ta positivité !
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                  <Link href="/teen">
                    <Button variant="outline" className="rounded-xl">
                      Retour aux activités
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      setEntries(['', '', ''])
                      setCurrentIndex(0)
                      setIsCompleted(false)
                      setShowEncouragement(false)
                    }}
                    className="bg-gradient-to-r from-pink-400 to-yellow-400 text-white rounded-xl hover:shadow-md"
                  >
                    Recommencer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-5">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-2xl">😊</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Améliore l'humeur</h4>
              <p className="text-sm text-gray-600">Réduit le stress et augmente la satisfaction de vie</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-yellow-100 p-5">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-2xl">💪</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Renforce la résilience</h4>
              <p className="text-sm text-gray-600">Aide à mieux faire face aux difficultés</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 p-5">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-2xl">🤝</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Développe les relations</h4>
              <p className="text-sm text-gray-600">Améliore la qualité des interactions sociales</p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-pink-50/50 to-white rounded-2xl border border-pink-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Les bienfaits de la gratitude</h3>
                <p className="text-xs text-gray-500">Science du bonheur</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Pratiquer la gratitude régulièrement améliore l'humeur, réduit le stress et renforce les liens sociaux. 
              Prends quelques minutes chaque jour pour noter ce qui te rend reconnaissant(e) !
            </p>
          </div>

          {/* Scientific Fact */}
          <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔬</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fait scientifique</h3>
                <p className="text-xs text-gray-500">Recherche en psychologie positive</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Selon les études de psychologie positive, pratiquer la gratitude régulièrement peut augmenter le bonheur de <strong>25%</strong> 
              et améliorer la qualité du sommeil de <strong>10%</strong>. C'est une habitude simple avec des effets profonds sur le bien-être.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}