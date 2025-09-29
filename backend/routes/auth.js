import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { supabase } from '../config/supabase.js'
import { logger } from '../config/logger.js'
import { asyncHandler, handleValidationError } from '../middleware/errorMiddleware.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// In-memory storage for demo (replace with database in production)
const users = new Map()

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
  role: Joi.string().valid('developer', 'verifier', 'admin', 'buyer').default('buyer'),
  organization: Joi.string().optional(),
  country: Joi.string().optional(),
  phone: Joi.string().optional()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = registerSchema.validate(req.body)
  if (error) {
    return res.status(400).json(handleValidationError(error))
  }

  const { email, password, fullName, role, organization, country, phone } = value

  // Check if user already exists (in-memory check)
  if (users.has(email)) {
    return res.status(400).json({
      success: false,
      error: 'User already exists with this email'
    })
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user object
  const userId = uuidv4()
  const user = {
    id: userId,
    email,
    password: hashedPassword,
    full_name: fullName,
    role,
    organization,
    country,
    phone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Store user in memory
  users.set(email, user)
  logger.info(`User registered: ${email} with role: ${role}`)

  // Generate token
  const token = generateToken(user.id)

  // Remove password from response
  const userResponse = { ...user }
  delete userResponse.password

  res.status(201).json({
    success: true,
    data: {
      user: userResponse,
      token
    }
  })
}))

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body)
  if (error) {
    return res.status(400).json(handleValidationError(error))
  }

  const { email, password } = value

  // Get user from memory
  const user = users.get(email)

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email or password'
    })
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email or password'
    })
  }

  // Generate token
  const token = generateToken(user.id)

  // Remove password from response
  const userResponse = { ...user }
  delete userResponse.password

  res.json({
    success: true,
    data: {
      user: userResponse,
      token
    }
  })
}))

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Find user by ID in memory
    let user = null
    for (const [email, userData] of users.entries()) {
      if (userData.id === decoded.userId) {
        user = { ...userData }
        delete user.password
        break
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    logger.error('Token verification error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    })
  }
}))

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    })
  }

  try {
    // Verify token even if expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true })
    
    // Generate new token
    const newToken = generateToken(decoded.userId)

    res.json({
      success: true,
      data: { token: newToken }
    })
  } catch (error) {
    logger.error('Token refresh error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    })
  }
}))

export default router