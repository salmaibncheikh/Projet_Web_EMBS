import mongoose from 'mongoose';

export interface IMealHistory {
  _id?: string;
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodDetected: string;
  portionG: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
  createdAt?: Date;
}

const MealHistorySchema = new mongoose.Schema({
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
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'snack'
  },
  foodDetected: {
    type: String,
    required: true
  },
  portionG: {
    type: Number,
    required: true
  },
  nutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true }
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
MealHistorySchema.index({ userId: 1, date: -1 });

export const MealHistory = mongoose.models.MealHistory || mongoose.model('MealHistory', MealHistorySchema);
