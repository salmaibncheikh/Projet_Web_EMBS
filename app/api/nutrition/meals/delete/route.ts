import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MealHistory } from '@/lib/models/meal-history';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get('mealId');
    const userId = searchParams.get('userId');

    if (!mealId || !userId) {
      return NextResponse.json(
        { error: 'mealId and userId are required' },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await connectDB();

    // Delete meal only if it belongs to the user
    const result = await MealHistory.findOneAndDelete({
      _id: mealId,
      userId: userId
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Meal not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal' },
      { status: 500 }
    );
  }
}
