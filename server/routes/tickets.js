import express from 'express'
import { authRequired } from '../middleware/auth.js'
import { registerTicket, scanTicket, getMyTickets } from '../controllers/ticketsController.js'

const router = express.Router()

router.post('/register', authRequired, registerTicket)
router.post('/scan', scanTicket)
router.get('/my', authRequired, getMyTickets)

export default router
