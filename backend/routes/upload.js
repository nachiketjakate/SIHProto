import express from 'express'
const router = express.Router()

router.post('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Upload endpoint - Coming soon' })
})

export default router