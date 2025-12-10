import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Medication } from '@/models/Medication'

// GET medications for user
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const active = searchParams.get('active') // 'true' or 'false'

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const query: any = { userId }
    
    // Filter for active medications only
    if (active === 'true') {
      const now = new Date()
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } }
      ]
    }

    const medications = await Medication.find(query)
      .sort({ startDate: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ medications }, { status: 200 })
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
  }
}

// POST new medication
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { userId, name, dosage, frequency, times, startDate, endDate, notes, reminderEnabled } = body

    if (!userId || !name || !dosage || !frequency || !times || times.length === 0) {
      return NextResponse.json(
        { error: 'userId, name, dosage, frequency, and times are required' },
        { status: 400 }
      )
    }

    const medication = await Medication.create({
      userId,
      name,
      dosage,
      frequency,
      times,
      startDate: startDate || new Date(),
      endDate: endDate || undefined,
      notes: notes || '',
      reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : true,
      adherence: {
        taken: 0,
        missed: 0
      }
    })

    return NextResponse.json({ medication }, { status: 201 })
  } catch (error) {
    console.error('Error creating medication:', error)
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 })
  }
}

// PUT update medication
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Medication id is required' }, { status: 400 })
    }

    const medication = await Medication.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!medication) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
    }

    return NextResponse.json({ medication }, { status: 200 })
  } catch (error) {
    console.error('Error updating medication:', error)
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 })
  }
}

// DELETE medication
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const medicationId = searchParams.get('id')

    if (!medicationId) {
      return NextResponse.json({ error: 'Medication id is required' }, { status: 400 })
    }

    const result = await Medication.findByIdAndDelete(medicationId)

    if (!result) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Medication deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting medication:', error)
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 })
  }
}
