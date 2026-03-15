import Event from '../models/Event.js'
import Ticket from '../models/Ticket.js'

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean()
    const enriched = await Promise.all(
      events.map(async (event) => {
        const sold = await Ticket.countDocuments({ eventId: event._id })
        return { ...event, sold }
      })
    )
    res.json(enriched)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const createEvent = async (req, res) => {
  try {
    const { title, date, capacity, location } = req.body
    if (!title || !date || !capacity || !location) {
      return res.status(400).json({ message: 'Missing fields' })
    }
    const event = await Event.create({
      organizerId: req.user.id,
      title,
      date,
      capacity,
      location
    })
    res.status(201).json(event)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getEventSummary = async (req, res) => {
  try {
    const { id } = req.params
    const event = await Event.findById(id)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    const sold = await Ticket.countDocuments({ eventId: id })
    res.json({ event, sold })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params
    const event = await Event.findById(id)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' })
    }
    await Event.findByIdAndDelete(id)
    await Ticket.deleteMany({ eventId: id })
    res.json({ message: 'Event deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params
    const { title, date, capacity, location } = req.body
    const event = await Event.findById(id)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this event' })
    }
    event.title = title || event.title
    event.date = date || event.date
    event.capacity = capacity || event.capacity
    event.location = location || event.location
    await event.save()
    res.json(event)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const completeEvent = async (req, res) => {
  try {
    const { id } = req.params
    const event = await Event.findById(id)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    if (event.status === 'completed') {
      return res.status(400).json({ message: 'Event already completed' })
    }
    event.status = 'completed'
    await event.save()
    res.json(event)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}
