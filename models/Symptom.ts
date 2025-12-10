import mongoose from 'mongoose'

export interface ISymptom {
  userId: string
  type: string
  severity: number
  notes?: string
  date: Date
}

const SymptomSchema = new mongoose.Schema<ISymptom>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['headache', 'fatigue', 'abdominal_pain', 'nausea', 'dizziness', 'muscle_pain', 'other']
  },
  severity: {
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

SymptomSchema.index({ userId: 1, date: -1 })

export const Symptom = mongoose.models.Symptom || mongoose.model<ISymptom>('Symptom', SymptomSchema)
