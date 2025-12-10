import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import GameScore from '@/models/GameScore'

// GET - Get user's game scores
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const userId = request.nextUrl.searchParams.get('userId')
    const gameType = request.nextUrl.searchParams.get('gameType')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const query: any = { userId }
    if (gameType) {
      query.gameType = gameType
    }

    const scores = await GameScore.find(query)
      .sort({ score: -1, completedAt: -1 })
      .limit(limit)

    // Get high score
    const highScore = scores.length > 0 ? scores[0].score : 0

    // Get total games played
    const totalGames = await GameScore.countDocuments({ userId })

    return NextResponse.json({
      scores,
      highScore,
      totalGames
    })

  } catch (error) {
    console.error('Error fetching game scores:', error)
    return NextResponse.json({ error: 'Failed to fetch game scores' }, { status: 500 })
  }
}

// POST - Save game score
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { userId, gameType, score, level, duration } = body

    if (!userId || !gameType || score === undefined || !duration) {
      return NextResponse.json({ 
        error: 'userId, gameType, score, and duration are required' 
      }, { status: 400 })
    }

    if (score < 0) {
      return NextResponse.json({ error: 'Score must be non-negative' }, { status: 400 })
    }

    const gameScore = await GameScore.create({
      userId,
      gameType,
      score,
      level: level || 1,
      duration
    })

    return NextResponse.json(gameScore, { status: 201 })

  } catch (error) {
    console.error('Error saving game score:', error)
    return NextResponse.json({ error: 'Failed to save game score' }, { status: 500 })
  }
}
