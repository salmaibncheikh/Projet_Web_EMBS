import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import BrainTest from '@/models/BrainTest'

// GET - Get user's brain test results
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const userId = request.nextUrl.searchParams.get('userId')
    const testType = request.nextUrl.searchParams.get('testType')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const query: any = { userId }
    if (testType) {
      query.testType = testType
    }

    const tests = await BrainTest.find(query)
      .sort({ completedAt: -1 })
      .limit(limit)

    // Calculate average score
    const avgScore = tests.length > 0
      ? tests.reduce((sum, test) => sum + test.score, 0) / tests.length
      : 0

    return NextResponse.json({
      tests,
      averageScore: Math.round(avgScore),
      totalTests: tests.length
    })

  } catch (error) {
    console.error('Error fetching brain tests:', error)
    return NextResponse.json({ error: 'Failed to fetch brain tests' }, { status: 500 })
  }
}

// POST - Save brain test result
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { userId, testType, score, duration, results } = body

    if (!userId || !testType || score === undefined || !duration) {
      return NextResponse.json({ 
        error: 'userId, testType, score, and duration are required' 
      }, { status: 400 })
    }

    if (score < 0 || score > 100) {
      return NextResponse.json({ error: 'Score must be between 0 and 100' }, { status: 400 })
    }

    const test = await BrainTest.create({
      userId,
      testType,
      score,
      duration,
      results: results || {}
    })

    return NextResponse.json(test, { status: 201 })

  } catch (error) {
    console.error('Error saving brain test:', error)
    return NextResponse.json({ error: 'Failed to save brain test' }, { status: 500 })
  }
}
