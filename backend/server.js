import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Import configurations and utilities
import { supabase } from './config/supabase.js'
import { logger } from './config/logger.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import { authMiddleware } from './middleware/authMiddleware.js'

// Import routes
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import verificationRoutes from './routes/verifications.js'
import creditRoutes from './routes/credits.js'
import marketplaceRoutes from './routes/marketplace.js'
import blockchainRoutes from './routes/blockchain.js'
import adminRoutes from './routes/admin.js'
import uploadRoutes from './routes/upload.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(compression())

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}))
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', authMiddleware, projectRoutes)
app.use('/api/verifications', authMiddleware, verificationRoutes)
app.use('/api/credits', authMiddleware, creditRoutes)
app.use('/api/marketplace', marketplaceRoutes) // Some endpoints public
app.use('/api/blockchain', authMiddleware, blockchainRoutes)
app.use('/api/admin', authMiddleware, adminRoutes)
app.use('/api/upload', authMiddleware, uploadRoutes)

// Public endpoints (no auth required)
app.get('/api/public/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        location_address,
        ecosystem_type,
        project_area,
        estimated_co2_sequestration,
        status,
        created_at,
        users!projects_developer_id_fkey(full_name, organization)
      `)
      .in('status', ['verified', 'tokenized'])
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error fetching public projects:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch projects' })
  }
})

app.get('/api/public/marketplace/listings', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        credits!marketplace_listings_credit_id_fkey(
          id,
          amount,
          metadata_ipfs_cid,
          projects!credits_project_id_fkey(
            title,
            ecosystem_type,
            location_address
          )
        ),
        users!marketplace_listings_seller_id_fkey(full_name, organization)
      `)
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error fetching marketplace listings:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch marketplace listings' })
  }
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    // Test Supabase connection (optional for demo mode)
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1)
      if (error) {
        logger.warn('Supabase connection failed - running in DEMO MODE with in-memory storage')
      } else {
        logger.info('Successfully connected to Supabase')
      }
    } catch (dbError) {
      logger.warn('Running in DEMO MODE - No database connection required')
      logger.info('User registration and login will use temporary in-memory storage')
    }

    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
      logger.info('API endpoints available:')
      logger.info('  - POST /api/auth/register')
      logger.info('  - POST /api/auth/login')
      logger.info('  - GET  /api/auth/me')
      logger.info('  - GET  /health')
    })
    
    // Store server reference for graceful shutdown
    global.server = server
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err)
  if (global.server) {
    global.server.close(() => {
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  if (global.server) {
    global.server.close(() => {
      logger.info('Process terminated')
    })
  }
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  if (global.server) {
    global.server.close(() => {
      logger.info('Process terminated')
    })
  }
})

startServer()