import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MealHistory } from '@/lib/models/meal-history';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, foodDetected, portionG, nutrition, mealType, imageUrl } = body;

    if (!userId || !foodDetected || !portionG || !nutrition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await connectDB();

    const meal = await MealHistory.create({
      userId,
      date: new Date(),
      mealType: mealType || 'snack',
      foodDetected,
      portionG,
      nutrition: {
        calories: nutrition.calories,
        protein: nutrition.protein_g || nutrition.protein,
        carbs: nutrition.carbs_g || nutrition.carbs,
        fat: nutrition.fat_g || nutrition.fat
      },
      imageUrl
    });

    return NextResponse.json({
      success: true,
      meal
    });
  } catch (error) {
    console.error('Error saving meal:', error);
    return NextResponse.json(
      { error: 'Failed to save meal' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7');

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

    const meals = await MealHistory.find({
      userId,
      date: { $gte: startDate }
    })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      meals
    });
  } catch (error) {
    console.error('Error fetching meal history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal history' },
      { status: 500 }
    );
  }
}
