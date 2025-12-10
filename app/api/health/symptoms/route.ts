import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Symptom } from '@/models/Symptom'

// GET symptoms for user
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

    const symptoms = await Symptom.find({
      userId,
      date: { $gte: dateLimit }
    })
      .sort({ date: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ symptoms }, { status: 200 })
  } catch (error) {
    console.error('Error fetching symptoms:', error)
    return NextResponse.json({ error: 'Failed to fetch symptoms' }, { status: 500 })
  }
}

// POST new symptom
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { userId, type, severity, notes } = body

    if (!userId || !type || !severity) {
      return NextResponse.json(
        { error: 'userId, type, and severity are required' },
        { status: 400 }
      )
    }

    if (severity < 1 || severity > 5) {
      return NextResponse.json(
        { error: 'severity must be between 1 and 5' },
        { status: 400 }
      )
    }

    const symptom = await Symptom.create({
      userId,
      type,
      severity,
      notes: notes || '',
      date: new Date()
    })

    return NextResponse.json({ symptom }, { status: 201 })
  } catch (error) {
    console.error('Error creating symptom:', error)
    return NextResponse.json({ error: 'Failed to create symptom' }, { status: 500 })
  }
}

// DELETE symptom
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const symptomId = searchParams.get('id')

    if (!symptomId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await Symptom.findByIdAndDelete(symptomId)

    return NextResponse.json({ message: 'Symptom deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting symptom:', error)
    return NextResponse.json({ error: 'Failed to delete symptom' }, { status: 500 })
  }
}
