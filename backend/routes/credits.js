import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Credits endpoint - Coming soon' })
})

export default router