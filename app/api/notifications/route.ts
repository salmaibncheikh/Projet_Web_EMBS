import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MealHistory } from '@/lib/models/meal-history';
import { NutritionGoals } from '@/lib/models/nutrition-goals';
import { MentalHealthRecord } from '@/lib/models/mental-health-record';

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

    await connectDB();

    const notifications: Array<{
      id: string;
      type: 'nutrition' | 'mental-health';
      category: 'success' | 'warning' | 'info' | 'error';
      title: string;
      message: string;
      timestamp: Date;
    }> = [];

    // Get nutrition insights
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentMeals = await MealHistory.find({
      userId,
      date: { $gte: weekAgo }
    }).lean();

    const userGoals = await NutritionGoals.findOne({ userId }).lean();

    if (recentMeals.length > 0 && userGoals) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayMeals = recentMeals.filter(
        m => new Date(m.date) >= todayStart
      );

      const todayNutrition = todayMeals.reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.nutrition?.calories || 0),
          protein: acc.protein + (meal.nutrition?.protein || 0),
          carbs: acc.carbs + (meal.nutrition?.carbs || 0),
          fat: acc.fat + (meal.nutrition?.fat || 0)
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Low protein warning
      const currentHour = new Date().getHours();
      if (currentHour >= 14 && todayNutrition.protein < userGoals.dailyProtein * 0.5) {
        notifications.push({
          id: `nutrition-protein-${new Date().toISOString()}`,
          type: 'nutrition',
          category: 'warning',
          title: 'Low Protein Intake',
          message: `You've only consumed ${Math.round(todayNutrition.protein)}g of protein today. Try to reach your ${userGoals.dailyProtein}g goal.`,
          timestamp: new Date()
        });
      }

      // Calorie goal achievement
      if (todayNutrition.calories >= userGoals.dailyCalories * 0.9 && 
          todayNutrition.calories <= userGoals.dailyCalories * 1.1) {
        notifications.push({
          id: `nutrition-calories-success-${new Date().toISOString()}`,
          type: 'nutrition',
          category: 'success',
          title: 'Calorie Goal Achieved!',
          message: `Great job! You're right on track with ${Math.round(todayNutrition.calories)} calories today.`,
          timestamp: new Date()
        });
      } else if (todayNutrition.calories > userGoals.dailyCalories + 500) {
        notifications.push({
          id: `nutrition-calories-high-${new Date().toISOString()}`,
          type: 'nutrition',
          category: 'warning',
          title: 'High Calorie Intake',
          message: `You've consumed ${Math.round(todayNutrition.calories)} calories, which is above your daily goal.`,
          timestamp: new Date()
        });
      }

      // Food variety check
      const uniqueFoods = new Set(recentMeals.map(m => m.foodDetected)).size;
      if (uniqueFoods < 5) {
        notifications.push({
          id: `nutrition-variety-${new Date().toISOString()}`,
          type: 'nutrition',
          category: 'info',
          title: 'Increase Food Variety',
          message: `Try to include more diverse foods in your diet. You've logged ${uniqueFoods} different foods this week.`,
          timestamp: new Date()
        });
      }

      // Meal tracking consistency
      if (todayMeals.length === 0 && currentHour >= 12) {
        notifications.push({
          id: `nutrition-tracking-${new Date().toISOString()}`,
          type: 'nutrition',
          category: 'info',
          title: 'Log Your Meals',
          message: "You haven't logged any meals today. Track your food to get better insights!",
          timestamp: new Date()
        });
      }
    }

    // Get mental health insights
    const mentalHealthRecords = await MentalHealthRecord.find({
      userId,
      date: { $gte: weekAgo }
    }).lean();

    if (mentalHealthRecords.length > 0) {
      const emotionRecords = mentalHealthRecords.filter(r => r.type === 'emotion');
      const chatbotRecords = mentalHealthRecords.filter(r => r.type === 'chatbot');

      // Check for negative emotions
      const recentNegativeEmotions = emotionRecords.filter(
        r => ['sad', 'anxious', 'stressed', 'angry'].includes(r.emotionData?.emotion?.toLowerCase() || '')
      );

      if (recentNegativeEmotions.length >= 2) {
        notifications.push({
          id: `mental-negative-emotions-${new Date().toISOString()}`,
          type: 'mental-health',
          category: 'warning',
          title: 'Emotional Support Available',
          message: "We've noticed some challenging emotions. Consider talking to our mental health chatbot or a professional.",
          timestamp: new Date()
        });
      }

      // Positive sentiment trend
      const positiveChatbots = chatbotRecords.filter(
        r => r.chatbotData?.sentiment === 'positive'
      );

      if (positiveChatbots.length >= 3) {
        notifications.push({
          id: `mental-positive-trend-${new Date().toISOString()}`,
          type: 'mental-health',
          category: 'success',
          title: 'Positive Mental Health Trend',
          message: "Your recent conversations show a positive outlook. Keep up the great work!",
          timestamp: new Date()
        });
      }

      // Encourage regular check-ins
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRecords = mentalHealthRecords.filter(
        r => new Date(r.date) >= today
      );

      if (todayRecords.length === 0 && new Date().getHours() >= 18) {
        notifications.push({
          id: `mental-checkin-${new Date().toISOString()}`,
          type: 'mental-health',
          category: 'info',
          title: 'Daily Mental Health Check-in',
          message: "Take a moment to check in with yourself. How are you feeling today?",
          timestamp: new Date()
        });
      }

      // Consistent engagement
      if (chatbotRecords.length >= 5) {
        notifications.push({
          id: `mental-engagement-${new Date().toISOString()}`,
          type: 'mental-health',
          category: 'success',
          title: 'Active Mental Wellness',
          message: `You've had ${chatbotRecords.length} mental health conversations this week. Your commitment is inspiring!`,
          timestamp: new Date()
        });
      }
    } else {
      // No mental health data
      notifications.push({
        id: `mental-start-${new Date().toISOString()}`,
        type: 'mental-health',
        category: 'info',
        title: 'Start Your Mental Health Journey',
        message: "Try our emotion analyzer or chat with our mental health assistant to track your wellbeing.",
        timestamp: new Date()
      });
    }

    // Sort by timestamp (most recent first)
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, 10) // Limit to 10 most recent
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
