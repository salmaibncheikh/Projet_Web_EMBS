import mongoose from 'mongoose'

export interface ITeenProfile {
  userId: string
  personalInfo: {
    name: string
    email: string
    phone?: string
    dateOfBirth?: Date
    location?: string
    profilePhoto?: string
  }
  healthInfo: {
    height?: number
    weight?: number
    bloodType?: string
    conditions?: string
    allergies?: string
  }
  notifications: {
    medicationReminders: boolean
    healthTips: boolean
    moodCheckIns: boolean
    weeklyReports: boolean
    messageAlerts: boolean
  }
  privacy: {
    shareHealthData: boolean
    allowDoctorAccess: boolean
    showOnlineStatus: boolean
  }
}

const TeenProfileSchema = new mongoose.Schema<ITeenProfile>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  personalInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    dateOfBirth: Date,
    location: String,
    profilePhoto: String
  },
  healthInfo: {
    height: Number,
    weight: Number,
    bloodType: String,
    conditions: String,
    allergies: String
  },
  notifications: {
    medicationReminders: { type: Boolean, default: true },
    healthTips: { type: Boolean, default: true },
    moodCheckIns: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false },
    messageAlerts: { type: Boolean, default: true }
  },
  privacy: {
    shareHealthData: { type: Boolean, default: false },
    allowDoctorAccess: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true }
  }
}, {
  timestamps: true
})

export const TeenProfile = mongoose.models.TeenProfile || mongoose.model<ITeenProfile>('TeenProfile', TeenProfileSchema)
