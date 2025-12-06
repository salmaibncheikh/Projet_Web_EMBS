import mongoose from 'mongoose';

export interface INutritionGoals {
  _id?: string;
  userId: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  trimester?: 1 | 2 | 3;
  updatedAt?: Date;
}

const NutritionGoalsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  dailyCalories: {
    type: Number,
    required: true,
    default: 2200 // Average for pregnant women
  },
  dailyProtein: {
    type: Number,
    required: true,
    default: 80 // grams
  },
  dailyCarbs: {
    type: Number,
    required: true,
    default: 250 // grams
  },
  dailyFat: {
    type: Number,
    required: true,
    default: 70 // grams
  },
  trimester: {
    type: Number,
    enum: [1, 2, 3],
    default: 2
  }
}, {
  timestamps: true
});

export const NutritionGoals = mongoose.models.NutritionGoals || mongoose.model('NutritionGoals', NutritionGoalsSchema);
