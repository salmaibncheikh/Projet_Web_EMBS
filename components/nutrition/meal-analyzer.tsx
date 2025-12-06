"use client"

import type React from "react"
import { useRef, useState } from "react"
import { AlertCircle, Camera, Loader } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

interface FoodTopK {
  label: string
  score: number
}

interface PortionNutrition {
  portion_g: number
  calories: number
  carbs_g: number
  fat_g: number
  protein_g: number
}

interface FoodResponse {
  best_label: string
  topk: FoodTopK[]
  nutrition_per_portion?: PortionNutrition | null
}

const API_ROUTE = "/api/nutrition/recipes"

const formatPercent = (score: number) => `${(score * 100).toFixed(1)}%`

export function MealAnalyzer() {
  const { user } = useAuth()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [portion, setPortion] = useState<number>(200)
  const [analysis, setAnalysis] = useState<FoodResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Images must be smaller than 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
      setAnalysis(null)
      setError(null)
    }
    reader.readAsDataURL(file)
    setImageFile(file)
  }

  const reset = () => {
    setImagePreview(null)
    setImageFile(null)
    setAnalysis(null)
    setError(null)
  }

  const analyzeMeal = async () => {
    if (!imageFile) {
      setError("Upload a meal photo before launching the analysis.")
      return
    }

    if (portion <= 0) {
      setError("Portion (in grams) must be greater than zero.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", imageFile, imageFile.name || "upload.jpg")
      formData.append("portion_g", portion.toString())
      formData.append("k", "1")

      const response = await fetch(API_ROUTE, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let message = "Meal analysis failed."
        try {
          const data = (await response.json()) as { error?: string; detail?: string }
          message = data.error || data.detail || message
        } catch {
          // ignore JSON parsing issues and keep default message
        }
        throw new Error(message)
      }

      const data = (await response.json()) as FoodResponse
      setAnalysis(data)

      // Save meal to history
      if (user && data.nutrition_per_portion) {
        saveMealToHistory(data, imagePreview)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error while analysing the meal."
      setError(message)
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePortionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)
    if (Number.isNaN(nextValue)) {
      setPortion(0)
      return
    }
    setPortion(nextValue)
  }

  const saveMealToHistory = async (data: FoodResponse, imageUrl: string | null) => {
    if (!user?._id || !data.nutrition_per_portion) return

    setSaving(true)
    try {
      const response = await fetch('/api/nutrition/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id,
          foodDetected: data.best_label,
          portionG: data.nutrition_per_portion.portion_g,
          nutrition: {
            calories: data.nutrition_per_portion.calories,
            protein: data.nutrition_per_portion.protein_g,
            carbs: data.nutrition_per_portion.carbs_g,
            fat: data.nutrition_per_portion.fat_g
          },
          mealType: 'snack', // Default to snack, can be enhanced with time-based detection
          imageUrl: imageUrl || undefined
        })
      })

      if (response.ok) {
        console.log('Meal saved successfully')
      }
    } catch (error) {
      console.error('Error saving meal:', error)
      // Don't show error to user, this is background operation
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="font-medium text-foreground mb-2">Take or upload a photo of your meal</p>
        <p className="text-sm text-muted-foreground">Click to browse or drag-and-drop an image to start</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {imagePreview && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Meal preview"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portion">Portion (g)</Label>
                  <Input
                    id="portion"
                    type="number"
                    min={10}
                    step={10}
                    value={portion}
                    onChange={handlePortionChange}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={analyzeMeal}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Analysing...
                      </span>
                    ) : (
                      "Analyse meal"
                    )}
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                disabled={loading}
                className="w-full md:w-auto"
              >
                Choose another photo
              </Button>
            </CardContent>
          </Card>

          {loading && (
            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Processing your meal...</p>
              </div>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Detected food</p>
                    <p className="text-2xl font-semibold text-foreground">{analysis.best_label}</p>
                  </div>
                </CardContent>
              </Card>

              {analysis.nutrition_per_portion && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">Nutrition estimate</p>
                      <p className="text-lg text-foreground">
                        Portion {analysis.nutrition_per_portion.portion_g} g
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-semibold text-primary">
                          {analysis.nutrition_per_portion.calories}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Calories</p>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-blue-500">
                          {analysis.nutrition_per_portion.protein_g} g
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Protein</p>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-amber-500">
                          {analysis.nutrition_per_portion.carbs_g} g
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Carbs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-red-500">
                          {analysis.nutrition_per_portion.fat_g} g
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Fat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
