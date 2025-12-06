import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MealHistory } from '@/lib/models/meal-history';
import { NutritionGoals } from '@/lib/models/nutrition-goals';

interface Recommendation {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  foods?: string[];
  tip?: string;
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

    // Get user's nutrition goals
    const goals = await NutritionGoals.findOne({ userId }).lean();
    if (!goals) {
      return NextResponse.json({
        success: true,
        recommendations: [{
          type: 'info',
          title: 'Welcome to Nutrition Tracking!',
          message: 'Start analyzing your meals to get personalized recommendations.',
          tip: 'Upload a photo of your meal in the "Meal Analysis" tab'
        }]
      });
    }

    // Get today's meals
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayMeals = await MealHistory.find({
      userId,
      date: { $gte: todayStart }
    }).lean();

    // Get last 7 days for trends
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyMeals = await MealHistory.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).lean();

    // Calculate totals
    const todayTotals = todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.nutrition?.calories || 0),
        protein: acc.protein + (meal.nutrition?.protein || 0),
        carbs: acc.carbs + (meal.nutrition?.carbs || 0),
        fat: acc.fat + (meal.nutrition?.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const weeklyAvg = weeklyMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.nutrition?.calories || 0),
        protein: acc.protein + (meal.nutrition?.protein || 0),
        carbs: acc.carbs + (meal.nutrition?.carbs || 0),
        fat: acc.fat + (meal.nutrition?.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const daysWithMeals = weeklyMeals.length > 0 ? 7 : 1;
    weeklyAvg.calories /= daysWithMeals;
    weeklyAvg.protein /= daysWithMeals;
    weeklyAvg.carbs /= daysWithMeals;
    weeklyAvg.fat /= daysWithMeals;

    // Count unique foods
    const uniqueFoods = new Set(weeklyMeals.map(m => m.foodDetected)).size;

    // Generate recommendations
    const recommendations: Recommendation[] = [];

    // 1. Protein check
    const proteinPercent = (todayTotals.protein / goals.dailyProtein) * 100;
    if (todayMeals.length > 0 && proteinPercent < 50 && new Date().getHours() > 14) {
      recommendations.push({
        type: 'warning',
        title: 'Low Protein Intake',
        message: `You've only consumed ${Math.round(todayTotals.protein)}g of your ${goals.dailyProtein}g daily protein goal.`,
        foods: ['grilled_salmon', 'chicken_curry', 'eggs_benedict', 'greek_salad'],
        tip: 'Add protein-rich foods to your next meal'
      });
    } else if (todayMeals.length > 0 && proteinPercent >= 80) {
      recommendations.push({
        type: 'success',
        title: 'Great Protein Intake!',
        message: `You're on track with ${Math.round(todayTotals.protein)}g of protein today.`,
        tip: 'Keep maintaining this balanced approach'
      });
    }

    // 2. Calorie check
    if (todayTotals.calories > goals.dailyCalories + 500) {
      recommendations.push({
        type: 'info',
        title: 'High Calorie Day',
        message: `You've consumed ${Math.round(todayTotals.calories)} calories today, above your ${goals.dailyCalories} goal.`,
        tip: 'Consider smaller portions or lighter foods for your next meal',
        foods: ['greek_salad', 'miso_soup', 'seaweed_salad', 'edamame']
      });
    } else if (todayMeals.length > 2 && todayTotals.calories < goals.dailyCalories * 0.7) {
      recommendations.push({
        type: 'warning',
        title: 'Low Calorie Intake',
        message: 'You may not be eating enough calories for you and your baby.',
        tip: 'Add nutrient-dense foods to meet your daily needs',
        foods: ['avocado', 'nuts', 'salmon', 'whole_grain_toast']
      });
    }

    // 3. Food variety
    if (weeklyMeals.length >= 7 && uniqueFoods < 5) {
      recommendations.push({
        type: 'info',
        title: 'Diversify Your Diet',
        message: `You've eaten ${uniqueFoods} different foods this week. Try adding more variety!`,
        foods: ['bibimbap', 'pad_thai', 'falafel', 'caprese_salad'],
        tip: 'Different foods provide different nutrients'
      });
    } else if (uniqueFoods >= 10) {
      recommendations.push({
        type: 'success',
        title: 'Excellent Food Variety!',
        message: `You've enjoyed ${uniqueFoods} different foods this week.`,
        tip: 'Great job maintaining a diverse and balanced diet!'
      });
    }

    // 4. Carbs and energy
    const carbPercent = (todayTotals.carbs / goals.dailyCarbs) * 100;
    if (todayMeals.length > 0 && carbPercent > 150) {
      recommendations.push({
        type: 'info',
        title: 'High Carbohydrate Intake',
        message: 'Consider balancing with more proteins and healthy fats.',
        foods: ['grilled_salmon', 'chicken_wings', 'deviled_eggs'],
        tip: 'Balance is key for stable energy levels'
      });
    }

    // 5. Healthy fats
    const fatPercent = (todayTotals.fat / goals.dailyFat) * 100;
    if (todayMeals.length > 0 && fatPercent < 40) {
      recommendations.push({
        type: 'info',
        title: 'Add Healthy Fats',
        message: 'Healthy fats are important for your baby\'s brain development.',
        foods: ['grilled_salmon', 'guacamole', 'hummus'],
        tip: 'Include sources of omega-3 fatty acids'
      });
    }

    // 6. Meal frequency
    if (todayMeals.length === 0 && new Date().getHours() > 12) {
      recommendations.push({
        type: 'warning',
        title: 'No Meals Tracked Today',
        message: 'Start tracking your meals to get personalized insights!',
        tip: 'Use the Meal Analyzer to photograph your food'
      });
    } else if (todayMeals.length >= 4) {
      recommendations.push({
        type: 'success',
        title: 'Great Meal Frequency!',
        message: 'Eating regular meals helps maintain stable blood sugar.',
        tip: 'Keep up this healthy eating pattern'
      });
    }

    // If no specific recommendations, give general advice
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'You\'re Doing Great!',
        message: 'Your nutrition looks balanced. Keep up the good work!',
        tip: 'Continue tracking your meals for the best insights'
      });
    }

    return NextResponse.json({
      success: true,
      recommendations: recommendations.slice(0, 4) // Limit to 4 recommendations
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
