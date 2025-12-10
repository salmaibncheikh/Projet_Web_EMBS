import mongoose from 'mongoose'

export interface IMedication {
  userId: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: Date
  endDate?: Date
  notes?: string
  reminderEnabled: boolean
  adherence: {
    taken: number
    missed: number
  }
}

const MedicationSchema = new mongoose.Schema<IMedication>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed']
  },
  times: {
    type: [String],
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  adherence: {
    taken: {
      type: Number,
      default: 0
    },
    missed: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

MedicationSchema.index({ userId: 1, startDate: -1 })

export const Medication = mongoose.models.Medication || mongoose.model<IMedication>('Medication', MedicationSchema)
