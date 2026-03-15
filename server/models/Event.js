import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    capacity: { type: Number, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' }
  },
  { timestamps: true }
)

export default mongoose.model('Event', eventSchema)
