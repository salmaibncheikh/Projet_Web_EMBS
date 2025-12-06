import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MentalHealthRecord } from '@/lib/models/mental-health-record';

interface MentalHealthStats {
  summary: {
    totalRecords: number;
    emotionRecords: number;
    chatbotInteractions: number;
    recordsThisWeek: number;
    recordsLastWeek: number;
  };
  emotions: {
    distribution: Record<string, number>;
    recent: Array<any>;
    mostFrequent: string;
    averageConfidence: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  weeklyTrend: Array<{
    week: string;
    emotionCount: number;
    chatbotCount: number;
    positiveRatio: number;
  }>;
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

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all records for the period
    const records = await MentalHealthRecord.find({
      userId,
      date: { $gte: startDate }
    })
      .sort({ date: -1 })
      .lean();

    // Calculate summary stats
    const emotionRecords = records.filter(r => r.type === 'emotion');
    const chatbotRecords = records.filter(r => r.type === 'chatbot');

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recordsThisWeek = records.filter(r => new Date(r.date) >= weekAgo).length;
    const recordsLastWeek = records.filter(
      r => new Date(r.date) >= twoWeeksAgo && new Date(r.date) < weekAgo
    ).length;

    // Emotion distribution
    const emotionDistribution: Record<string, number> = {};
    let totalConfidence = 0;
    
    emotionRecords.forEach(record => {
      if (record.emotionData?.emotion) {
        const emotion = record.emotionData.emotion;
        emotionDistribution[emotion] = (emotionDistribution[emotion] || 0) + 1;
        totalConfidence += record.emotionData.confidence || 0;
      }
    });

    const mostFrequentEmotion = Object.keys(emotionDistribution).length > 0
      ? Object.entries(emotionDistribution).sort((a, b) => b[1] - a[1])[0][0]
      : 'none';

    const averageConfidence = emotionRecords.length > 0 
      ? totalConfidence / emotionRecords.length 
      : 0;

    // Sentiment analysis from chatbot interactions
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    chatbotRecords.forEach(record => {
      const sentiment = record.chatbotData?.sentiment;
      if (sentiment === 'positive') positiveCount++;
      else if (sentiment === 'neutral') neutralCount++;
      else if (sentiment === 'negative') negativeCount++;
    });

    // Determine sentiment trend
    const recentWeekRecords = chatbotRecords.filter(
      r => new Date(r.date) >= weekAgo
    );
    const previousWeekRecords = chatbotRecords.filter(
      r => new Date(r.date) >= twoWeeksAgo && new Date(r.date) < weekAgo
    );

    const recentPositiveRatio = recentWeekRecords.length > 0
      ? recentWeekRecords.filter(r => r.chatbotData?.sentiment === 'positive').length / recentWeekRecords.length
      : 0;

    const previousPositiveRatio = previousWeekRecords.length > 0
      ? previousWeekRecords.filter(r => r.chatbotData?.sentiment === 'positive').length / previousWeekRecords.length
      : 0;

    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentPositiveRatio > previousPositiveRatio + 0.1) trend = 'improving';
    else if (recentPositiveRatio < previousPositiveRatio - 0.1) trend = 'declining';

    // Weekly trend (last 4 weeks)
    const weeklyTrend: Array<any> = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekRecords = records.filter(
        r => new Date(r.date) >= weekStart && new Date(r.date) < weekEnd
      );

      const weekEmotions = weekRecords.filter(r => r.type === 'emotion').length;
      const weekChatbot = weekRecords.filter(r => r.type === 'chatbot').length;
      const weekPositive = weekRecords.filter(
        r => r.type === 'chatbot' && r.chatbotData?.sentiment === 'positive'
      ).length;
      const positiveRatio = weekChatbot > 0 ? (weekPositive / weekChatbot) * 100 : 0;

      weeklyTrend.unshift({
        week: `Week ${4 - i}`,
        emotionCount: weekEmotions,
        chatbotCount: weekChatbot,
        positiveRatio: Math.round(positiveRatio)
      });
    }

    // Generate insights
    const insights: Array<any> = [];

    // Insight 1: Tracking consistency
    if (recordsThisWeek > recordsLastWeek) {
      insights.push({
        type: 'success',
        title: 'Great Progress!',
        message: `You've been more active this week with ${recordsThisWeek} check-ins, up from ${recordsLastWeek} last week.`
      });
    } else if (recordsThisWeek < recordsLastWeek && recordsThisWeek < 3) {
      insights.push({
        type: 'info',
        title: 'Stay Connected',
        message: 'Regular check-ins help us track your wellness better. Try to engage more this week!'
      });
    }

    // Insight 2: Emotion patterns
    if (mostFrequentEmotion && emotionRecords.length >= 5) {
      const positiveEmotions = ['happy', 'calm', 'relaxed', 'joyful', 'content'];
      const negativeEmotions = ['sad', 'anxious', 'stressed', 'angry', 'worried'];
      
      if (positiveEmotions.includes(mostFrequentEmotion.toLowerCase())) {
        insights.push({
          type: 'success',
          title: 'Positive Emotional State',
          message: `Your most common emotion is "${mostFrequentEmotion}". Keep doing what makes you feel good!`
        });
      } else if (negativeEmotions.includes(mostFrequentEmotion.toLowerCase())) {
        insights.push({
          type: 'warning',
          title: 'Emotional Support Available',
          message: `We notice "${mostFrequentEmotion}" appearing frequently. Consider talking to our chatbot or your doctor.`
        });
      }
    }

    // Insight 3: Sentiment trend
    if (trend === 'improving') {
      insights.push({
        type: 'success',
        title: 'Improving Mental Wellness',
        message: 'Your recent interactions show a positive trend. You\'re doing great!'
      });
    } else if (trend === 'declining') {
      insights.push({
        type: 'warning',
        title: 'Need Extra Support?',
        message: 'We notice some challenges lately. Remember, help is always available.'
      });
    }

    // Insight 4: Engagement
    if (chatbotRecords.length < 5 && days >= 30) {
      insights.push({
        type: 'info',
        title: 'Try Our Mental Health Chatbot',
        message: 'Talk to our AI assistant about your feelings, concerns, or just to check in!'
      });
    }

    const stats: MentalHealthStats = {
      summary: {
        totalRecords: records.length,
        emotionRecords: emotionRecords.length,
        chatbotInteractions: chatbotRecords.length,
        recordsThisWeek,
        recordsLastWeek
      },
      emotions: {
        distribution: emotionDistribution,
        recent: emotionRecords.slice(0, 10),
        mostFrequent: mostFrequentEmotion,
        averageConfidence: Math.round(averageConfidence * 100)
      },
      sentiment: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
        trend
      },
      weeklyTrend,
      insights
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error generating mental health report:', error);
    return NextResponse.json(
      { error: 'Failed to generate mental health report' },
      { status: 500 }
    );
  }
}
