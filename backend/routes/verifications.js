import express from 'express'
const router = express.Router()

// Placeholder verifications routes
router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Verifications endpoint - Coming soon' })
})

export default router