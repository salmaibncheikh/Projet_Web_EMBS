"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Apple, TrendingUp, Utensils, Target } from "lucide-react"

interface NutritionStats {
  summary: {
    totalMeals: number
    mealsThisWeek: number
    mealsLastWeek: number
    averageDailyCalories: number
    goalAchievementRate: number
  }
  nutrients: {
    averageCalories: number
    averageProtein: number
    averageCarbs: number
    averageFat: number
    caloriesVsGoal: number
    proteinVsGoal: number
    carbsVsGoal: number
    fatVsGoal: number
  }
  topFoods: Array<{
    food: string
    count: number
    totalCalories: number
  }>
  weeklyTrend: Array<{
    week: string
    meals: number
    calories: number
    goalProgress: number
  }>
  foodDiversity: {
    uniqueFoods: number
    diversityScore: number
  }
  insights: Array<{
    type: 'success' | 'warning' | 'info'
    title: string
    message: string
  }>
}

export function NutritionReport() {
  const { user } = useAuth()
  const [stats, setStats] = useState<NutritionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?._id) {
      fetchReport()
    }
  }, [user])

  const fetchReport = async () => {
    if (!user?._id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/reports/nutrition?userId=${user._id}&days=30`)
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching nutrition report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto" />
          <p className="text-gray-600">Chargement du rapport nutrition...</p>
        </div>
      </div>
    )
  }

  if (!stats || stats.summary.totalMeals === 0) {
    return (
      <div className="bg-green-50/30 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm p-8">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-400/20 flex items-center justify-center mx-auto">
            <Apple className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg">Aucune donnée nutritionnelle</h3>
          <p className="text-sm text-gray-600">
            Commencez à analyser vos repas pour voir votre rapport nutritionnel !
          </p>
        </div>
      </div>
    )
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const macroData = [
    { name: 'Protein', value: stats.nutrients.proteinVsGoal, color: 'from-blue-500 to-blue-600', icon: '💪' },
    { name: 'Carbs', value: stats.nutrients.carbsVsGoal, color: 'from-amber-500 to-amber-600', icon: '🌾' },
    { name: 'Fat', value: stats.nutrients.fatVsGoal, color: 'from-green-500 to-green-600', icon: '🥑' }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-orange-50/60 backdrop-blur-sm rounded-2xl border-l-4 border-orange-400/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Repas</p>
              <p className="text-2xl font-bold text-gray-800">{stats.summary.totalMeals}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400/70 to-orange-500/70 flex items-center justify-center shadow-sm">
              <Utensils className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50/60 backdrop-blur-sm rounded-2xl border-l-4 border-purple-400/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Calories/Jour</p>
              <p className="text-2xl font-bold text-gray-800">{stats.summary.averageDailyCalories}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/70 to-purple-500/70 flex items-center justify-center shadow-sm">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50/60 backdrop-blur-sm rounded-2xl border-l-4 border-blue-400/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Variété</p>
              <p className="text-2xl font-bold text-gray-800">{stats.foodDiversity.uniqueFoods}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/70 to-blue-500/70 flex items-center justify-center shadow-sm">
              <Apple className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-green-50/60 backdrop-blur-sm rounded-2xl border-l-4 border-green-400/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Objectif Atteint</p>
              <p className="text-2xl font-bold text-gray-800">{stats.summary.goalAchievementRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/70 to-green-500/70 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrients Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Macronutrients vs Goals</CardTitle>
          <CardDescription>Your average nutrient intake compared to daily targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {macroData.map((macro) => (
              <div key={macro.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{macro.icon}</span>
                    <span className="font-semibold">{macro.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${
                    macro.value >= 90 && macro.value <= 110 ? 'text-green-600' :
                    macro.value < 70 ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {macro.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`bg-gradient-to-r ${macro.color} h-3 rounded-full transition-all`}
                    style={{ width: `${Math.min(macro.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Foods */}
      {stats.topFoods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Top 10 Foods</CardTitle>
            <CardDescription>Most frequently analyzed meals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topFoods.map((food, index) => (
                <div key={food.food} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    <div>
                      <p className="font-semibold capitalize text-sm">
                        {food.food.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {food.count} time{food.count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{food.totalCalories} kcal</p>
                    <p className="text-xs text-muted-foreground">total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Trend */}
      {stats.weeklyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>4-Week Trend</CardTitle>
            <CardDescription>Your nutrition progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-around gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
              {stats.weeklyTrend.map((week) => (
                <div key={week.week} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="text-xs text-muted-foreground font-semibold">
                    {week.calories}
                  </div>
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 group-hover:shadow-lg bg-gradient-to-t from-orange-600 via-orange-500 to-orange-400 shadow-md"
                    style={{ height: `${Math.max((week.calories / 2500) * 150, 20)}px` }}
                    title={`${week.calories} kcal - ${week.goalProgress}% of goal`}
                  />
                  <span className="text-xs font-bold text-foreground">{week.week}</span>
                </div>
              ))}
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
