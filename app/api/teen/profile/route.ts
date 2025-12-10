import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { TeenProfile } from '@/models/TeenProfile'

// GET profile for user
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    let profile = await TeenProfile.findOne({ userId }).lean()

    // Create default profile if doesn't exist
    if (!profile) {
      profile = await TeenProfile.create({
        userId,
        personalInfo: {
          name: '',
          email: userId
        },
        healthInfo: {},
        notifications: {
          medicationReminders: true,
          healthTips: true,
          moodCheckIns: true,
          weeklyReports: false,
          messageAlerts: true
        },
        privacy: {
          shareHealthData: false,
          allowDoctorAccess: true,
          showOnlineStatus: true
        }
      })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT update profile
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { userId, ...updates } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const profile = await TeenProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    )

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

// POST create or update profile
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const profile = await TeenProfile.findOneAndUpdate(
      { userId },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    )

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating profile:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
