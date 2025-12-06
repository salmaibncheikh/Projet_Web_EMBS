import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MealHistory } from '@/lib/models/meal-history';
import { NutritionGoals } from '@/lib/models/nutrition-goals';

interface DashboardStats {
  today: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealsCount: number;
  };
  goals: {
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
  };
  weeklyTrend: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  recentMeals: Array<any>;
  foodDistribution: Record<string, number>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await connectDB();

    // Get user's nutrition goals or create defaults
    let goals = await NutritionGoals.findOne({ userId }).lean();
    if (!goals) {
      goals = await NutritionGoals.create({
        userId,
        dailyCalories: 2200,
        dailyProtein: 80,
        dailyCarbs: 250,
        dailyFat: 70,
        trimester: 2
      });
    }

    // Get today's meals
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayMeals = await MealHistory.find({
      userId,
      date: { $gte: todayStart, $lte: todayEnd }
    }).lean();

    // Calculate today's totals
    const todayTotals = todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.nutrition?.calories || 0),
        protein: acc.protein + (meal.nutrition?.protein || 0),
        carbs: acc.carbs + (meal.nutrition?.carbs || 0),
        fat: acc.fat + (meal.nutrition?.fat || 0),
        mealsCount: acc.mealsCount + 1
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 }
    );

    // Get last 7 days for weekly trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyMeals = await MealHistory.find({
      userId,
      date: { $gte: sevenDaysAgo }
    })
      .sort({ date: 1 })
      .lean();

    // Group by date (using local date to avoid timezone issues)
    const dailyStats = new Map<string, any>();
    weeklyMeals.forEach((meal) => {
      const mealDate = new Date(meal.date);
      // Format as YYYY-MM-DD in local timezone
      const year = mealDate.getFullYear();
      const month = String(mealDate.getMonth() + 1).padStart(2, '0');
      const day = String(mealDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        });
      }
      const dayStats = dailyStats.get(dateKey);
      dayStats.calories += meal.nutrition?.calories || 0;
      dayStats.protein += meal.nutrition?.protein || 0;
      dayStats.carbs += meal.nutrition?.carbs || 0;
      dayStats.fat += meal.nutrition?.fat || 0;
    });

    const weeklyTrend = Array.from(dailyStats.values());

    // Get recent 5 meals
    const recentMeals = await MealHistory.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Calculate food distribution
    const foodDistribution: Record<string, number> = {};
    weeklyMeals.forEach((meal) => {
      const food = meal.foodDetected;
      foodDistribution[food] = (foodDistribution[food] || 0) + 1;
    });

    const stats: DashboardStats = {
      today: todayTotals,
      goals: {
        dailyCalories: goals.dailyCalories,
        dailyProtein: goals.dailyProtein,
        dailyCarbs: goals.dailyCarbs,
        dailyFat: goals.dailyFat
      },
      weeklyTrend,
      recentMeals,
      foodDistribution
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
