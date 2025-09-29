import express from 'express'
import { supabase } from '../config/supabase.js'
import { logger } from '../config/logger.js'
import { asyncHandler } from '../middleware/errorMiddleware.js'
import { requireDeveloper, requireVerifierOrAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// @route   GET /api/projects
// @desc    Get projects for current user
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      users!projects_developer_id_fkey(full_name, organization)
    `)
    .eq('developer_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching projects:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    })
  }

  res.json({
    success: true,
    data
  })
}))

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Developer only)
router.post('/', requireDeveloper, asyncHandler(async (req, res) => {
  const projectData = {
    ...req.body,
    developer_id: req.user.id,
    status: 'draft'
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single()

  if (error) {
    logger.error('Error creating project:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create project'
    })
  }

  res.status(201).json({
    success: true,
    data
  })
}))

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      users!projects_developer_id_fkey(full_name, organization),
      verifications(*),
      credits(*)
    `)
    .eq('id', req.params.id)
    .single()

  if (error) {
    logger.error('Error fetching project:', error)
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    })
  }

  // Check if user can access this project
  const canAccess = 
    req.user.role === 'admin' ||
    req.user.id === data.developer_id ||
    (req.user.role === 'verifier' && ['submitted', 'under_review'].includes(data.status))

  if (!canAccess) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    })
  }

  res.json({
    success: true,
    data
  })
}))

export default router