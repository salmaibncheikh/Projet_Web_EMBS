"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { 
  Brain, 
  Timer,
  Target,
  Zap,
  Award,
  Play,
  RotateCcw,
  TrendingUp,
  ChevronRight,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface GameScore {
  memory: number
  attention: number
  speed: number
  logic: number
}

interface MemoryCard {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export default function CognitiveGamesPage() {
  const { user } = useAuth()
  const [activeGame, setActiveGame] = useState<'menu' | 'memory' | 'attention' | 'speed' | 'logic'>('menu')
  const [scores, setScores] = useState<GameScore>({ memory: 0, attention: 0, speed: 0, logic: 0 })
  const [highScores, setHighScores] = useState<any>({})
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  
  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [memoryGameActive, setMemoryGameActive] = useState(false)
  
  // Attention Game State
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [attentionScore, setAttentionScore] = useState(0)
  const [attentionTimer, setAttentionTimer] = useState(30)
  const [attentionGameActive, setAttentionGameActive] = useState(false)
  
  // Speed Game State
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [speedLevel, setSpeedLevel] = useState(1)
  const [speedGameActive, setSpeedGameActive] = useState(false)
  const [showSequence, setShowSequence] = useState(false)

  const emojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐']

  useEffect(() => {
    if (user?.id) {
      fetchGameScores()
    }
  }, [user])

  const fetchGameScores = async () => {
    try {
      const response = await fetch(`/api/teen/game-scores?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setHighScores({
          puzzle: data.highScore || 0,
          memory: data.highScore || 0
        })
      }
    } catch (error) {
      console.error('Error fetching game scores:', error)
    }
  }

  const saveGameScore = async (gameType: string, score: number, duration: number) => {
    if (!user?.id) return

    try {
      await fetch('/api/teen/game-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameType,
          score,
          level: 1,
          duration
        })
      })

      // Log game activity
      await fetch('/api/teen/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          activityType: 'game_played',
          metadata: { gameType, score }
        })
      })

      await fetchGameScores()
    } catch (error) {
      console.error('Error saving game score:', error)
    }
  }

  const initMemoryGame = () => {
    setGameStartTime(Date.now())
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({
        id: idx,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
    setMemoryCards(shuffled)
    setFlippedCards([])
    setMoves(0)
    setMatchedPairs(0)
    setMemoryGameActive(true)
  }

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(id) || memoryCards[id].isMatched) return
    
    const newFlipped = [...flippedCards, id]
    setFlippedCards(newFlipped)
    
    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      const [first, second] = newFlipped
      if (memoryCards[first].emoji === memoryCards[second].emoji) {
        setTimeout(() => {
          setMemoryCards(cards => cards.map(card => 
            card.id === first || card.id === second ? { ...card, isMatched: true } : card
          ))
          const newMatchedPairs = matchedPairs + 1
          setMatchedPairs(newMatchedPairs)
          setFlippedCards([])
          
          // Game completed
          if (newMatchedPairs === 8) {
            const duration = Math.floor((Date.now() - gameStartTime) / 1000)
            const score = Math.max(0, 100 - moves * 2) // Score based on moves
            saveGameScore('memory', score, duration)
          }
        }, 500)
      } else {
        setTimeout(() => setFlippedCards([]), 1000)
      }
    }
  }

  const startAttentionGame = () => {
    setAttentionScore(0)
    setAttentionTimer(30)
    setAttentionGameActive(true)
    moveTarget()
  }

  const moveTarget = () => {
    setTargetPosition({
      x: Math.random() * 80,
      y: Math.random() * 80
    })
  }

  const handleTargetClick = () => {
    setAttentionScore(attentionScore + 10)
    moveTarget()
  }

  useEffect(() => {
    if (attentionGameActive && attentionTimer > 0) {
      const timer = setTimeout(() => setAttentionTimer(attentionTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (attentionTimer === 0) {
      setAttentionGameActive(false)
    }
  }, [attentionTimer, attentionGameActive])

  const startSpeedGame = () => {
    const newSequence = Array.from({ length: speedLevel + 2 }, () => Math.floor(Math.random() * 4))
    setSequence(newSequence)
    setUserSequence([])
    setShowSequence(true)
    setSpeedGameActive(true)
    
    setTimeout(() => setShowSequence(false), (speedLevel + 2) * 600)
  }

  const handleSpeedButton = (num: number) => {
    if (showSequence) return
    
    const newUserSequence = [...userSequence, num]
    setUserSequence(newUserSequence)
    
    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      alert(`Incorrect ! Séquence: ${sequence.join(', ')}`)
      setSpeedGameActive(false)
    } else if (newUserSequence.length === sequence.length) {
      alert(`Bravo ! Niveau ${speedLevel} réussi !`)
      setSpeedLevel(speedLevel + 1)
      setTimeout(startSpeedGame, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-pink-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🧠</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">Jeux Cognitifs</h1>
              <p className="text-white/90 mt-1 font-medium">Entraîne ton cerveau, améliore tes capacités</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mémoire', score: scores.memory, icon: Brain, color: 'purple' },
          { label: 'Attention', score: scores.attention, icon: Target, color: 'blue' },
          { label: 'Vitesse', score: scores.speed, icon: Zap, color: 'yellow' },
          { label: 'Logique', score: scores.logic, icon: Award, color: 'pink' },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-${item.color}-400/70 to-${item.color}-500/70 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-800">{item.score}</span>
                  <span className="text-sm text-gray-600">/100</span>
                </div>
              </div>
              <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 transition-all`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Game Menu */}
      {activeGame === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              id: 'memory', 
              title: 'Memory Match', 
              description: 'Retrouve les paires identiques',
              icon: '🃏',
              color: 'purple',
              skill: 'Mémoire à court terme'
            },
            { 
              id: 'attention', 
              title: 'Cible Rapide', 
              description: 'Clique sur les cibles le plus vite possible',
              icon: '🎯',
              color: 'blue',
              skill: 'Attention visuelle'
            },
            { 
              id: 'speed', 
              title: 'Séquence', 
              description: 'Mémorise et reproduis la séquence',
              icon: '⚡',
              color: 'yellow',
              skill: 'Traitement rapide'
            },
            { 
              id: 'logic', 
              title: 'Puzzle Logique', 
              description: 'Résous des énigmes de logique',
              icon: '🧩',
              color: 'pink',
              skill: 'Raisonnement'
            },
          ].map((game) => (
            <div 
              key={game.id}
              className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setActiveGame(game.id as any)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br from-${game.color}-400/20 to-${game.color}-500/20 rounded-xl flex items-center justify-center text-3xl`}>
                  {game.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{game.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{game.description}</p>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {game.skill}
                  </span>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Game */}
      {activeGame === 'memory' && (
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Memory Match</h2>
              <p className="text-gray-600">Trouve toutes les paires !</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Mouvements</p>
                <p className="text-2xl font-bold text-purple-600">{moves}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Paires</p>
                <p className="text-2xl font-bold text-green-600">{matchedPairs}/8</p>
              </div>
            </div>
          </div>

          {!memoryGameActive ? (
            <div className="text-center py-12">
              <Button onClick={initMemoryGame} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-8 py-6 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Commencer
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                {memoryCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-xl text-4xl flex items-center justify-center transition-all ${
                      flippedCards.includes(card.id) || card.isMatched
                        ? 'bg-white border-2 border-purple-300'
                        : 'bg-gradient-to-br from-purple-400 to-pink-500'
                    } ${card.isMatched ? 'opacity-50' : 'hover:scale-105'}`}
                  >
                    {(flippedCards.includes(card.id) || card.isMatched) ? card.emoji : '?'}
                  </button>
                ))}
              </div>
              
              {matchedPairs === 8 && (
                <div className="mt-6 text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Bravo !</h3>
                  <p className="text-gray-700 mb-4">Tu as terminé en {moves} mouvements</p>
                  <Button onClick={() => setActiveGame('menu')} className="rounded-xl">
                    Retour au menu
                  </Button>
                </div>
              )}
              
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={initMemoryGame} variant="outline" className="rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recommencer
                </Button>
                <Button onClick={() => setActiveGame('menu')} variant="outline" className="rounded-xl">
                  Menu
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Attention Game */}
      {activeGame === 'attention' && (
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Cible Rapide</h2>
              <p className="text-gray-600">Clique sur les cibles !</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-blue-600">{attentionScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Temps</p>
                <p className="text-2xl font-bold text-orange-600">{attentionTimer}s</p>
              </div>
            </div>
          </div>

          {!attentionGameActive ? (
            <div className="text-center py-12">
              <Button onClick={startAttentionGame} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-8 py-6 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Commencer
              </Button>
            </div>
          ) : (
            <>
              <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 overflow-hidden">
                <button
                  onClick={handleTargetClick}
                  className="absolute w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform"
                  style={{ left: `${targetPosition.x}%`, top: `${targetPosition.y}%` }}
                >
                  🎯
                </button>
              </div>
              
              {attentionTimer === 0 && (
                <div className="mt-6 text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Terminé !</h3>
                  <p className="text-gray-700 mb-4">Score final: {attentionScore} points</p>
                  <Button onClick={() => setActiveGame('menu')} className="rounded-xl">
                    Retour au menu
                  </Button>
                </div>
              )}
              
              <div className="mt-6 flex justify-center">
                <Button onClick={() => setActiveGame('menu')} variant="outline" className="rounded-xl">
                  Menu
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Speed Game */}
      {activeGame === 'speed' && (
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-yellow-200/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Jeu de Séquence</h2>
              <p className="text-gray-600">Mémorise et reproduis !</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Niveau</p>
              <p className="text-2xl font-bold text-yellow-600">{speedLevel}</p>
            </div>
          </div>

          {!speedGameActive ? (
            <div className="text-center py-12">
              <Button onClick={startSpeedGame} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl px-8 py-6 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Commencer
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                {showSequence ? (
                  <p className="text-lg font-semibold text-gray-800">Mémorise la séquence...</p>
                ) : (
                  <p className="text-lg font-semibold text-gray-800">À toi de jouer !</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleSpeedButton(num)}
                    disabled={showSequence}
                    className={`aspect-square rounded-2xl text-6xl flex items-center justify-center transition-all ${
                      showSequence && sequence[userSequence.length] === num
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-110'
                        : 'bg-gradient-to-br from-gray-200 to-gray-300 hover:scale-105'
                    } disabled:opacity-50`}
                  >
                    {['🔴', '🔵', '🟢', '🟡'][num]}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={startSpeedGame} variant="outline" className="rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recommencer
                </Button>
                <Button onClick={() => setActiveGame('menu')} variant="outline" className="rounded-xl">
                  Menu
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Logic Game Placeholder */}
      {activeGame === 'logic' && (
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-pink-200/30 shadow-sm p-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">🧩</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Puzzle Logique</h2>
            <p className="text-gray-600 mb-6">Jeu en développement - Bientôt disponible !</p>
            <Button onClick={() => setActiveGame('menu')} className="rounded-xl">
              Retour au menu
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
