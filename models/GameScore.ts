import mongoose from 'mongoose'

const GameScoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  gameType: {
    type: String,
    enum: ['puzzle', 'memory', 'logic', 'reaction'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  level: {
    type: Number,
    default: 1
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

GameScoreSchema.index({ userId: 1, completedAt: -1 })
GameScoreSchema.index({ userId: 1, gameType: 1, score: -1 })

export default mongoose.models.GameScore || mongoose.model('GameScore', GameScoreSchema)
