"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Brain, TrendingUp, MessageCircle, Smile } from "lucide-react"

interface MentalHealthStats {
  summary: {
    totalRecords: number
    emotionRecords: number
    chatbotInteractions: number
    recordsThisWeek: number
    recordsLastWeek: number
  }
  emotions: {
    distribution: Record<string, number>
    recent: Array<any>
    mostFrequent: string
    averageConfidence: number
  }
  sentiment: {
    positive: number
    neutral: number
    negative: number
    trend: 'improving' | 'stable' | 'declining'
  }
  weeklyTrend: Array<{
    week: string
    emotionCount: number
    chatbotCount: number
    positiveRatio: number
  }>
  insights: Array<{
    type: 'success' | 'warning' | 'info'
    title: string
    message: string
  }>
}

export function MentalHealthReport() {
  const { user } = useAuth()
  const [stats, setStats] = useState<MentalHealthStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (user?._id) {
      fetchReport()
    }
  }, [user, days])

  const fetchReport = async () => {
    if (!user?._id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/reports/mental-health?userId=${user._id}&days=${days}`)
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching mental health report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
          <p className="text-gray-600">Chargement du rapport santé mentale...</p>
        </div>
      </div>
    )
  }

  if (!stats || stats.summary.totalRecords === 0) {
    return (
      <div className="bg-purple-50/30 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-8">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">Aucune donnée de santé mentale</h3>
          <p className="text-sm text-gray-600">
            Commencez à suivre vos émotions et à discuter avec notre IA pour voir votre rapport de bien-être mental !
          </p>
        </div>
      </div>
    )
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'declining': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const totalSentiment = stats.sentiment.positive + stats.sentiment.neutral + stats.sentiment.negative
  const positivePercent = totalSentiment > 0 
    ? Math.round((stats.sentiment.positive / totalSentiment) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-purple-50/60 backdrop-blur-sm rounded-2xl border-l-4 border-purple-400/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Check-ins</p>
              <p className="text-2xl font-bold text-gray-800">{stats.summary.totalRecords}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/70 to-purple-500/70 flex items-center justify-center shadow-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-pink-50/60 backdrop-blur-sm rounded-2xl border-l-4 border-pink-400/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Émotions Suivies</p>
              <p className="text-2xl font-bold text-gray-800">{stats.emotions.distribution && Object.keys(stats.emotions.distribution).length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400/70 to-pink-500/70 flex items-center justify-center shadow-sm">
              <Smile className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50/60 backdrop-blur-sm rounded-2xl border-l-4 border-blue-400/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Conversations IA</p>
              <p className="text-2xl font-bold text-gray-800">{stats.summary.chatbotInteractions}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/70 to-blue-500/70 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`backdrop-blur-sm rounded-2xl border-l-4 p-6 shadow-sm hover:shadow-md transition-all ${
          stats.sentiment.trend === 'improving' ? 'bg-green-50/60 border-green-400/60' : 
          stats.sentiment.trend === 'declining' ? 'bg-red-50/60 border-red-400/60' : 
          'bg-gray-50/60 border-gray-400/60'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Tendance</p>
              <p className={`text-2xl font-bold capitalize ${getTrendColor(stats.sentiment.trend)}`}>
                {stats.sentiment.trend === 'improving' ? 'Amélioration' : stats.sentiment.trend === 'declining' ? 'Déclin' : 'Stable'}
              </p>
            </div>
            <span className="text-3xl">{getTrendIcon(stats.sentiment.trend)}</span>
          </div>
        </div>
      </div>

      {/* Emotion Distribution */}
      {Object.keys(stats.emotions.distribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emotion Distribution</CardTitle>
            <CardDescription>Your emotional patterns over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.emotions.distribution)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => {
                  const total = Object.values(stats.emotions.distribution).reduce((a, b) => a + b, 0)
                  const percentage = Math.round((count / total) * 100)
                  
                  return (
                    <div key={emotion} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{emotion}</span>
                        <span className="text-muted-foreground">{count} times ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
            {stats.emotions.mostFrequent !== 'none' && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Most Frequent Emotion:</span>{' '}
                  <span className="capitalize">{stats.emotions.mostFrequent}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sentiment Analysis */}
      {totalSentiment > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Sentiment</CardTitle>
            <CardDescription>Analysis of your chatbot interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="12"
                      strokeDasharray={`${(positivePercent / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">{positivePercent}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.sentiment.positive}</p>
                  <p className="text-xs text-muted-foreground">Positive</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{stats.sentiment.neutral}</p>
                  <p className="text-xs text-muted-foreground">Neutral</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.sentiment.negative}</p>
                  <p className="text-xs text-muted-foreground">Negative</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {stats.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.insights.map((insight, index) => (
            <Card key={index} className={`border-2 ${getInsightColor(insight.type)}`}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-sm mb-2">{insight.title}</h3>
                <p className="text-xs opacity-90">{insight.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
