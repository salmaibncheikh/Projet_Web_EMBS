import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import ActivityLog from '@/models/ActivityLog'

// GET - Get user activities and calculate streak
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get login activities from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const loginActivities = await ActivityLog.find({
      userId,
      activityType: 'login',
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 })

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let checkDate = new Date(today)
    const loginDates = new Set(
      loginActivities.map(activity => {
        const date = new Date(activity.date)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
    )

    // Check if logged in today
    if (loginDates.has(today.getTime())) {
      currentStreak = 1
      checkDate.setDate(checkDate.getDate() - 1)
      
      // Count consecutive days
      while (loginDates.has(checkDate.getTime())) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
    }

    // Get today's activities by type
    const todayStart = new Date(today)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const todayActivities = await ActivityLog.find({
      userId,
      date: { $gte: todayStart, $lte: todayEnd }
    })

    const activityCounts = {
      symptom_logged: 0,
      mood_logged: 0,
      meal_scanned: 0,
      brain_test: 0,
      medication_taken: 0,
      game_played: 0
    }

    todayActivities.forEach(activity => {
      if (activityCounts.hasOwnProperty(activity.activityType)) {
        activityCounts[activity.activityType]++
      }
    })

    return NextResponse.json({
      currentStreak,
      todayActivities: activityCounts,
      totalActivitiesToday: todayActivities.length
    })

  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST - Log a new activity
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { userId, activityType, metadata } = body

    if (!userId || !activityType) {
      return NextResponse.json({ error: 'userId and activityType are required' }, { status: 400 })
    }

    const activity = await ActivityLog.create({
      userId,
      activityType,
      metadata: metadata || {}
    })

    return NextResponse.json(activity, { status: 201 })

  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}
