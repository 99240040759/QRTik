import express from 'express'
import { authRequired } from '../middleware/auth.js'
import {
  getEvents,
  createEvent,
  getEventSummary,
  deleteEvent,
  updateEvent,
  completeEvent
} from '../controllers/eventsController.js'

const router = express.Router()

router.get('/', getEvents)
router.post('/', authRequired, createEvent)
router.get('/:id/summary', getEventSummary)
router.delete('/:id', authRequired, deleteEvent)
router.put('/:id', authRequired, updateEvent)
router.patch('/:id/complete', authRequired, completeEvent)

export default router
