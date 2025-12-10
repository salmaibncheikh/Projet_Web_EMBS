import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Meal from '@/models/Meal'

// GET - Get user's meals for today
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const userId = request.nextUrl.searchParams.get('userId')
    const days = parseInt(request.nextUrl.searchParams.get('days') || '1')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const meals = await Meal.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 })

    return NextResponse.json({ meals })

  } catch (error) {
    console.error('Error fetching meals:', error)
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 })
  }
}

// POST - Save a new meal
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { userId, name, calories, protein, carbs, fat, time, image } = body

    if (!userId || !name || calories === undefined || !time) {
      return NextResponse.json({ 
        error: 'userId, name, calories, and time are required' 
      }, { status: 400 })
    }

    const meal = await Meal.create({
      userId,
      name,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      time,
      image
    })

    return NextResponse.json(meal, { status: 201 })

  } catch (error) {
    console.error('Error saving meal:', error)
    return NextResponse.json({ error: 'Failed to save meal' }, { status: 500 })
  }
}

// DELETE - Delete a meal
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const mealId = request.nextUrl.searchParams.get('id')
    
    if (!mealId) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 })
    }

    await Meal.findByIdAndDelete(mealId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting meal:', error)
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 })
  }
}
