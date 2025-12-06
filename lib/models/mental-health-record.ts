import mongoose from 'mongoose';

export interface IMentalHealthRecord {
  _id?: string;
  userId: string;
  date: Date;
  type: 'emotion' | 'chatbot';
  
  // For emotion analysis (drawing)
  emotionData?: {
    emotion: string;
    confidence: number;
    intensity?: number;
    imageUrl?: string;
  };
  
  // For chatbot interactions
  chatbotData?: {
    topic?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    keywords?: string[];
    messageCount?: number;
  };
  
  notes?: string;
  createdAt?: Date;
}

const MentalHealthRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  type: {
    type: String,
    enum: ['emotion', 'chatbot'],
    required: true
  },
  emotionData: {
    emotion: { type: String },
    confidence: { type: Number },
    intensity: { type: Number },
    imageUrl: { type: String }
  },
  chatbotData: {
    topic: { type: String },
    sentiment: { 
      type: String, 
      enum: ['positive', 'neutral', 'negative'] 
    },
    keywords: [{ type: String }],
    messageCount: { type: Number }
  },
  notes: { type: String }
}, {
  timestamps: true
});

// Create compound index for efficient queries
MentalHealthRecordSchema.index({ userId: 1, date: -1 });
MentalHealthRecordSchema.index({ userId: 1, type: 1, date: -1 });

export const MentalHealthRecord = mongoose.models.MentalHealthRecord || mongoose.model('MentalHealthRecord', MentalHealthRecordSchema);
