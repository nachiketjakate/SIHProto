import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'
import { logger } from '../config/logger.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      })
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    logger.error('Auth middleware error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired.'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Authentication error.'
    })
  }
}

// Middleware to check specific roles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      })
    }

    const userRole = req.user.role
    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions.'
      })
    }

    next()
  }
}

// Specific role middlewares
export const requireDeveloper = requireRole('developer')
export const requireVerifier = requireRole('verifier')
export const requireAdmin = requireRole('admin')
export const requireBuyer = requireRole('buyer')

// Multiple role middleware
export const requireDeveloperOrAdmin = requireRole(['developer', 'admin'])
export const requireVerifierOrAdmin = requireRole(['verifier', 'admin'])