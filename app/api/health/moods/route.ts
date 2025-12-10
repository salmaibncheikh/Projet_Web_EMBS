import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { MoodEntry } from '@/models/MoodEntry'

// GET mood entries for user
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const days = parseInt(searchParams.get('days') || '30')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - days)

    const moods = await MoodEntry.find({
      userId,
      date: { $gte: dateLimit }
    })
      .sort({ date: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ moods }, { status: 200 })
  } catch (error) {
    console.error('Error fetching mood entries:', error)
    return NextResponse.json({ error: 'Failed to fetch mood entries' }, { status: 500 })
  }
}

// POST new mood entry
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { userId, mood, notes } = body

    if (!userId || !mood) {
      return NextResponse.json(
        { error: 'userId and mood are required' },
        { status: 400 }
      )
    }

    if (mood < 1 || mood > 5) {
      return NextResponse.json(
        { error: 'mood must be between 1 and 5' },
        { status: 400 }
      )
    }

    const moodEntry = await MoodEntry.create({
      userId,
      mood,
      notes: notes || '',
      date: new Date()
    })

    return NextResponse.json({ moodEntry }, { status: 201 })
  } catch (error) {
    console.error('Error creating mood entry:', error)
    return NextResponse.json({ error: 'Failed to create mood entry' }, { status: 500 })
  }
}

// DELETE mood entry
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const moodId = searchParams.get('id')

    if (!moodId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await MoodEntry.findByIdAndDelete(moodId)

    return NextResponse.json({ message: 'Mood entry deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting mood entry:', error)
    return NextResponse.json({ error: 'Failed to delete mood entry' }, { status: 500 })
  }
}
