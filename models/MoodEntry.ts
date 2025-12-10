import mongoose from 'mongoose'

export interface IMoodEntry {
  userId: string
  mood: number // 1-5 (very sad to very happy)
  notes?: string
  date: Date
}

const MoodEntrySchema = new mongoose.Schema<IMoodEntry>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

MoodEntrySchema.index({ userId: 1, date: -1 })

export const MoodEntry = mongoose.models.MoodEntry || mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema)
