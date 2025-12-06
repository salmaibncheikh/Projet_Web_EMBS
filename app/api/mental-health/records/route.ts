import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MentalHealthRecord } from '@/lib/models/mental-health-record';

// Save emotion analysis or chatbot interaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, emotionData, chatbotData, notes } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      );
    }

    if (type === 'emotion' && !emotionData) {
      return NextResponse.json(
        { error: 'emotionData is required for emotion type' },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await connectDB();

    const record = await MentalHealthRecord.create({
      userId,
      date: new Date(),
      type,
      emotionData,
      chatbotData,
      notes
    });

    return NextResponse.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Error saving mental health record:', error);
    return NextResponse.json(
      { error: 'Failed to save mental health record' },
      { status: 500 }
    );
  }
}

// Get mental health records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'emotion' or 'chatbot'
    const days = parseInt(searchParams.get('days') || '30');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query: any = {
      userId,
      date: { $gte: startDate }
    };

    if (type) {
      query.type = type;
    }

    const records = await MentalHealthRecord.find(query)
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Error fetching mental health records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mental health records' },
      { status: 500 }
    );
  }
}
