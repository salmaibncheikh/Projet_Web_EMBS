import mongoose from 'mongoose'

const MealSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true,
    default: 0
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  time: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

MealSchema.index({ userId: 1, date: -1 })

export default mongoose.models.Meal || mongoose.model('Meal', MealSchema)
