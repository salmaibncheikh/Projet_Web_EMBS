"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, TrendingUp, Apple, Flame, Droplets, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  today: {
    calories: number
    protein: number
    carbs: number
    fat: number
    mealsCount: number
  }
  goals: {
    dailyCalories: number
    dailyProtein: number
    dailyCarbs: number
    dailyFat: number
  }
  weeklyTrend: Array<{
    date: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }>
  recentMeals: Array<any>
  foodDistribution: Record<string, number>
}

interface Recommendation {
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  foods?: string[]
  tip?: string
}

export function NutritionDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (user?._id) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?._id) return

    try {
      // Fetch stats first for faster initial display
      const statsResponse = await fetch(`/api/nutrition/dashboard-stats?userId=${user._id}`)
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setStats(statsData.stats)
        setLoading(false) // Show stats immediately
      }

      // Fetch recommendations in background
      const recsResponse = await fetch(`/api/nutrition/recommendations?userId=${user._id}`)
      const recsData = await recsResponse.json()
      
      if (recsData.success) {
        setRecommendations(recsData.recommendations)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    if (!user?._id) return

    try {
      const response = await fetch(`/api/nutrition/dashboard-stats?userId=${user._id}`)
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const fetchRecommendations = async () => {
    if (!user?._id) return

    try {
      const response = await fetch(`/api/nutrition/recommendations?userId=${user._id}`)
      const data = await response.json()
      if (data.success) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!user?._id || !confirm('Are you sure you want to delete this meal?')) return

    setDeleting(mealId)
    try {
      const response = await fetch(`/api/nutrition/meals/delete?mealId=${mealId}&userId=${user._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        // Refresh dashboard data
        await fetchDashboardData()
        await fetchRecommendations()
      } else {
        alert('Failed to delete meal: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting meal:', error)
      alert('Failed to delete meal')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your nutrition dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <Apple className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold">Start Tracking Your Nutrition</h3>
            <p className="text-sm text-muted-foreground">
              Analyze your first meal to see your personalized dashboard!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const todayPercentages = {
    calories: (stats.today.calories / stats.goals.dailyCalories) * 100,
    protein: (stats.today.protein / stats.goals.dailyProtein) * 100,
    carbs: (stats.today.carbs / stats.goals.dailyCarbs) * 100,
    fat: (stats.today.fat / stats.goals.dailyFat) * 100
  }

  const goalMetrics = [
    { 
      label: "Calories", 
      current: Math.round(stats.today.calories), 
      goal: stats.goals.dailyCalories, 
      unit: "kcal",
      icon: "🔥",
      bg: "bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-150",
      text: "text-purple-700",
      bar: "bg-gradient-to-r from-purple-500 to-indigo-500",
      borderColor: "border-l-4 border-purple-500"
    },
    { 
      label: "Protein", 
      current: Math.round(stats.today.protein), 
      goal: stats.goals.dailyProtein, 
      unit: "g",
      icon: "💪",
      bg: "bg-gradient-to-br from-rose-50 via-pink-100 to-red-150",
      text: "text-rose-700",
      bar: "bg-gradient-to-r from-pink-500 to-rose-500",
      borderColor: "border-l-4 border-pink-500"
    },
    { 
      label: "Carbs", 
      current: Math.round(stats.today.carbs), 
      goal: stats.goals.dailyCarbs, 
      unit: "g",
      icon: "🌾",
      bg: "bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-150",
      text: "text-amber-700",
      bar: "bg-gradient-to-r from-yellow-500 to-orange-500",
      borderColor: "border-l-4 border-yellow-500"
    },
    { 
      label: "Fat", 
      current: Math.round(stats.today.fat), 
      goal: stats.goals.dailyFat, 
      unit: "g",
      icon: "🥑",
      bg: "bg-gradient-to-br from-emerald-50 via-green-100 to-teal-150",
      text: "text-emerald-700",
      bar: "bg-gradient-to-r from-green-500 to-emerald-500",
      borderColor: "border-l-4 border-green-500"
    }
  ]

  // Calculate macronutrient percentages for pie chart
  const totalMacros = stats.today.protein + stats.today.carbs + stats.today.fat
  const macroPercentages = {
    protein: totalMacros > 0 ? (stats.today.protein / totalMacros) * 100 : 33,
    carbs: totalMacros > 0 ? (stats.today.carbs / totalMacros) * 100 : 33,
    fat: totalMacros > 0 ? (stats.today.fat / totalMacros) * 100 : 34
  }

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      case 'error': return '❌'
      default: return '💡'
    }
  }

  return (
    <div className="space-y-6">
      {/* Today's Progress Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Today's Nutrition</h2>
            <p className="text-sm text-muted-foreground">
              {stats.today.mealsCount} meal{stats.today.mealsCount !== 1 ? 's' : ''} tracked today
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goalMetrics.map((metric) => {
            const percentage = (metric.current / metric.goal) * 100

            return (
              <Card
                key={metric.label}
                className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${metric.bg} ${metric.borderColor} hover:scale-105`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{metric.icon}</span>
                        <h3 className={`font-bold text-foreground text-sm ${metric.text}`}>{metric.label}</h3>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${metric.text} bg-white/50`}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${metric.bar} shadow-md`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span>
                        {metric.current} {metric.unit}
                      </span>
                      <span>
                        Goal: {metric.goal} {metric.unit}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Weekly Trend Chart */}
      {stats.weeklyTrend.length > 0 && (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-foreground">Weekly Calorie Trend</CardTitle>
            <CardDescription>Your calorie intake over the past week</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] flex items-end justify-around gap-3 p-6 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-150 rounded-lg">
              {stats.weeklyTrend.map((data) => {
                const date = new Date(data.date)
                const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })
                const height = stats.goals.dailyCalories > 0 
                  ? (data.calories / stats.goals.dailyCalories) * 250 
                  : 0

                return (
                  <div key={data.date} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="text-xs text-muted-foreground font-semibold">
                      {Math.round(data.calories)}
                    </div>
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover:shadow-lg group-hover:opacity-100 opacity-80 bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400 shadow-md"
                      style={{ height: `${Math.max(height, 20)}px` }}
                      title={`${Math.round(data.calories)} kcal`}
                    />
                    <span className="text-xs font-bold text-foreground group-hover:text-purple-600 transition-colors">
                      {dayLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className={`border-2 ${getRecommendationColor(rec.type)}`}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getRecommendationIcon(rec.type)}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">{rec.title}</h3>
                        <p className="text-xs opacity-90">{rec.message}</p>
                        {rec.tip && (
                          <p className="text-xs mt-2 font-semibold italic">💡 {rec.tip}</p>
                        )}
                        {rec.foods && rec.foods.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold mb-1">Suggested foods:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.foods.slice(0, 3).map((food) => (
                                <span key={food} className="text-xs px-2 py-1 bg-white rounded-full">
                                  {food.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Meals */}
      {stats.recentMeals.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-foreground">Recent Meals</CardTitle>
            <CardDescription>Your last analyzed meals</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {stats.recentMeals.map((meal: any) => (
                <div key={meal._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm capitalize">
                      {meal.foodDetected.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(meal.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600">
                        {meal.nutrition?.calories || 0} kcal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {meal.portionG}g
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMeal(meal._id)}
                      disabled={deleting === meal._id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleting === meal._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
