import mongoose from 'mongoose'

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['symptom_logged', 'mood_logged', 'meal_scanned', 'brain_test', 'medication_taken', 'game_played', 'login'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
})

// Compound index for efficient queries
ActivityLogSchema.index({ userId: 1, date: -1 })
ActivityLogSchema.index({ userId: 1, activityType: 1, date: -1 })

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema)
