import jwt from 'jsonwebtoken'
import Ticket from '../models/Ticket.js'
import Event from '../models/Event.js'
import User from '../models/User.js'

export const registerTicket = async (req, res) => {
  try {
    const { eventId } = req.body
    if (!eventId) {
      return res.status(400).json({ message: 'Missing fields' })
    }
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    if (event.status === 'completed') {
      return res.status(400).json({ message: 'Event has ended' })
    }
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }
    const existing = await Ticket.findOne({ eventId, attendeeId: req.user.id })
    if (existing) {
      return res.status(400).json({ message: 'Already registered for this event' })
    }
    const sold = await Ticket.countDocuments({ eventId })
    if (sold >= event.capacity) {
      return res.status(400).json({ message: 'Event sold out' })
    }
    const ticket = await Ticket.create({
      eventId,
      attendeeId: req.user.id
    })
    const token = jwt.sign(
      { ticketId: ticket._id.toString(), eventId: eventId.toString() },
      process.env.JWT_SECRET
    )
    res.status(201).json({ ticket, token })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const scanTicket = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ message: 'Missing token' })
    }
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ message: 'Invalid token' })
    }
    const ticket = await Ticket.findById(payload.ticketId)
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }
    const event = await Event.findById(ticket.eventId)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    if (event.status === 'completed') {
      return res.status(400).json({ message: 'Event has ended' })
    }
    if (ticket.isScanned) {
      return res.status(400).json({ message: 'Ticket already scanned' })
    }
    ticket.isScanned = true
    ticket.scannedAt = new Date()
    await ticket.save()
    res.json({ message: 'Valid entry', ticket })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ attendeeId: req.user.id })
    const enrichedTickets = await Promise.all(
      tickets.map(async (t) => {
        const event = await Event.findById(t.eventId)
        const token = jwt.sign(
          { ticketId: t._id.toString(), eventId: t.eventId.toString() },
          process.env.JWT_SECRET
        )
        return { ticket: t, event, token }
      })
    )
    res.json(enrichedTickets)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}
