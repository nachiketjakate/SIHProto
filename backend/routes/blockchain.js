import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Blockchain endpoint - Coming soon' })
})

export default router