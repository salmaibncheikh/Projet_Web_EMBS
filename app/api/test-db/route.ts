import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await connectDB()
    
    const connectionState = mongoose.connection.readyState
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }

    return NextResponse.json({
      success: true,
      status: states[connectionState as keyof typeof states] || 'unknown',
      database: mongoose.connection.db?.databaseName || 'N/A',
      message: connectionState === 1 ? '✅ MongoDB is connected!' : 'MongoDB connection status: ' + states[connectionState as keyof typeof states]
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error.message,
        message: '❌ Failed to connect to MongoDB'
      },
      { status: 500 }
    )
  }
}
