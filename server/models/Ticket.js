import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isScanned: { type: Boolean, default: false },
    scannedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

export default mongoose.model('Ticket', ticketSchema)
