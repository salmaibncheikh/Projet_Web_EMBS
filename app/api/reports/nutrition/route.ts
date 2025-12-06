import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MealHistory } from '@/lib/models/meal-history';
import { NutritionGoals } from '@/lib/models/nutrition-goals';

interface NutritionStats {
  summary: {
    totalMeals: number;
    mealsThisWeek: number;
    mealsLastWeek: number;
    averageDailyCalories: number;
    goalAchievementRate: number;
  };
  nutrients: {
    averageCalories: number;
    averageProtein: number;
    averageCarbs: number;
    averageFat: number;
    caloriesVsGoal: number;
    proteinVsGoal: number;
    carbsVsGoal: number;
    fatVsGoal: number;
  };
  topFoods: Array<{
    food: string;
    count: number;
    totalCalories: number;
  }>;
  weeklyTrend: Array<{
    week: string;
    meals: number;
    calories: number;
    goalProgress: number;
  }>;
  foodDiversity: {
    uniqueFoods: number;
    diversityScore: number;
  };
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user's nutrition goals
    const goals = await NutritionGoals.findOne({ userId }).lean();
    const defaultGoals = {
      dailyCalories: 2200,
      dailyProtein: 80,
      dailyCarbs: 250,
      dailyFat: 70
    };
    const userGoals = goals || defaultGoals;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all meals for the period
    const meals = await MealHistory.find({
      userId,
      date: { $gte: startDate }
    })
      .sort({ date: -1 })
      .lean();

    if (meals.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          summary: {
            totalMeals: 0,
            mealsThisWeek: 0,
            mealsLastWeek: 0,
            averageDailyCalories: 0,
            goalAchievementRate: 0
          },
          nutrients: {
            averageCalories: 0,
            averageProtein: 0,
            averageCarbs: 0,
            averageFat: 0,
            caloriesVsGoal: 0,
            proteinVsGoal: 0,
            carbsVsGoal: 0,
            fatVsGoal: 0
          },
          topFoods: [],
          weeklyTrend: [],
          foodDiversity: { uniqueFoods: 0, diversityScore: 0 },
          insights: [{
            type: 'info',
            title: 'Start Tracking Your Meals',
            message: 'Begin analyzing your meals to see detailed nutrition reports!'
          }]
        }
      });
    }

    // Calculate weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const mealsThisWeek = meals.filter(m => new Date(m.date) >= weekAgo).length;
    const mealsLastWeek = meals.filter(
      m => new Date(m.date) >= twoWeeksAgo && new Date(m.date) < weekAgo
    ).length;

    // Calculate average nutrients
    const totalNutrients = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.nutrition?.calories || 0),
        protein: acc.protein + (meal.nutrition?.protein || 0),
        carbs: acc.carbs + (meal.nutrition?.carbs || 0),
        fat: acc.fat + (meal.nutrition?.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const avgNutrients = {
      calories: Math.round(totalNutrients.calories / meals.length),
      protein: Math.round(totalNutrients.protein / meals.length),
      carbs: Math.round(totalNutrients.carbs / meals.length),
      fat: Math.round(totalNutrients.fat / meals.length)
    };

    // Calculate daily averages and goal achievement
    const daysWithMeals = new Set(
      meals.map(m => new Date(m.date).toDateString())
    ).size;

    const avgDailyCalories = Math.round(totalNutrients.calories / daysWithMeals);
    const goalAchievementRate = Math.round(
      (avgDailyCalories / userGoals.dailyCalories) * 100
    );

    // Nutrient vs goals
    const nutrients = {
      averageCalories: avgNutrients.calories,
      averageProtein: avgNutrients.protein,
      averageCarbs: avgNutrients.carbs,
      averageFat: avgNutrients.fat,
      caloriesVsGoal: Math.round((avgDailyCalories / userGoals.dailyCalories) * 100),
      proteinVsGoal: Math.round(
        ((totalNutrients.protein / daysWithMeals) / userGoals.dailyProtein) * 100
      ),
      carbsVsGoal: Math.round(
        ((totalNutrients.carbs / daysWithMeals) / userGoals.dailyCarbs) * 100
      ),
      fatVsGoal: Math.round(
        ((totalNutrients.fat / daysWithMeals) / userGoals.dailyFat) * 100
      )
    };

    // Top foods
    const foodCounts: Record<string, { count: number; calories: number }> = {};
    meals.forEach(meal => {
      const food = meal.foodDetected;
      if (!foodCounts[food]) {
        foodCounts[food] = { count: 0, calories: 0 };
      }
      foodCounts[food].count++;
      foodCounts[food].calories += meal.nutrition?.calories || 0;
    });

    const topFoods = Object.entries(foodCounts)
      .map(([food, data]) => ({
        food,
        count: data.count,
        totalCalories: Math.round(data.calories)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Weekly trend (last 4 weeks)
    const weeklyTrend: Array<any> = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekMeals = meals.filter(
        m => new Date(m.date) >= weekStart && new Date(m.date) < weekEnd
      );

      const weekCalories = weekMeals.reduce(
        (sum, m) => sum + (m.nutrition?.calories || 0),
        0
      );

      const weekDays = new Set(
        weekMeals.map(m => new Date(m.date).toDateString())
      ).size;

      const avgWeekCalories = weekDays > 0 ? weekCalories / weekDays : 0;
      const goalProgress = Math.round(
        (avgWeekCalories / userGoals.dailyCalories) * 100
      );

      weeklyTrend.unshift({
        week: `Week ${4 - i}`,
        meals: weekMeals.length,
        calories: Math.round(avgWeekCalories),
        goalProgress
      });
    }

    // Food diversity
    const uniqueFoods = Object.keys(foodCounts).length;
    const diversityScore = Math.min(Math.round((uniqueFoods / 20) * 100), 100);

    // Generate insights
    const insights: Array<any> = [];

    // Meal tracking consistency
    if (mealsThisWeek > mealsLastWeek) {
      insights.push({
        type: 'success',
        title: 'Excellent Tracking!',
        message: `You logged ${mealsThisWeek} meals this week, up from ${mealsLastWeek} last week.`
      });
    } else if (mealsThisWeek < 7) {
      insights.push({
        type: 'info',
        title: 'Track More Meals',
        message: 'Try to log at least one meal per day for better insights.'
      });
    }

    // Calorie goals
    if (goalAchievementRate >= 90 && goalAchievementRate <= 110) {
      insights.push({
        type: 'success',
        title: 'Perfect Calorie Balance!',
        message: `You're hitting your daily calorie goal at ${goalAchievementRate}%.`
      });
    } else if (goalAchievementRate < 80) {
      insights.push({
        type: 'warning',
        title: 'Low Calorie Intake',
        message: `You're at ${goalAchievementRate}% of your goal. Make sure you're eating enough for you and your baby.`
      });
    } else if (goalAchievementRate > 120) {
      insights.push({
        type: 'info',
        title: 'High Calorie Intake',
        message: `You're at ${goalAchievementRate}% of your goal. Consider adjusting portion sizes.`
      });
    }

    // Protein intake
    if (nutrients.proteinVsGoal < 70) {
      insights.push({
        type: 'warning',
        title: 'Low Protein Intake',
        message: 'Protein is essential for your baby\'s development. Add more protein-rich foods!'
      });
    }

    // Food diversity
    if (diversityScore >= 70) {
      insights.push({
        type: 'success',
        title: 'Great Food Variety!',
        message: `You've eaten ${uniqueFoods} different foods. Variety ensures balanced nutrition!`
      });
    } else if (diversityScore < 40) {
      insights.push({
        type: 'info',
        title: 'Add More Variety',
        message: 'Try new foods to ensure you get a wide range of nutrients.'
      });
    }

    const stats: NutritionStats = {
      summary: {
        totalMeals: meals.length,
        mealsThisWeek,
        mealsLastWeek,
        averageDailyCalories: avgDailyCalories,
        goalAchievementRate
      },
      nutrients,
      topFoods,
      weeklyTrend,
      foodDiversity: {
        uniqueFoods,
        diversityScore
      },
      insights
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error generating nutrition report:', error);
    return NextResponse.json(
      { error: 'Failed to generate nutrition report' },
      { status: 500 }
    );
  }
}
