import mongoose from 'mongoose'

const BrainTestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  testType: {
    type: String,
    enum: ['memory', 'attention', 'problem_solving', 'processing_speed'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

BrainTestSchema.index({ userId: 1, completedAt: -1 })
BrainTestSchema.index({ userId: 1, testType: 1, completedAt: -1 })

export default mongoose.models.BrainTest || mongoose.model('BrainTest', BrainTestSchema)
