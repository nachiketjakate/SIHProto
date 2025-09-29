import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Public pages
export const PublicRegistry = () => (
  <div className="min-h-screen p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Public Registry</h1>
      <p className="text-gray-600">Browse verified blue carbon projects and their impact data.</p>
      <div className="mt-8 text-center py-16 text-gray-500">
        <span className="text-6xl mb-4 block">🌊</span>
        <p className="text-xl">Coming soon - Public project registry</p>
      </div>
    </div>
  </div>
)

export const Marketplace = () => (
  <div className="min-h-screen p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Carbon Credit Marketplace</h1>
      <p className="text-gray-600">Browse and purchase verified blue carbon credits.</p>
      <div className="mt-8 text-center py-16 text-gray-500">
        <span className="text-6xl mb-4 block">🛒</span>
        <p className="text-xl">Coming soon - Credit marketplace</p>
      </div>
    </div>
  </div>
)

// Developer pages
export const ProjectList = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // First try to fetch from API
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      } else {
        // Fall back to local storage if API fails
        const localProjects = JSON.parse(localStorage.getItem('projects') || '[]')
        setProjects(localProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      // Fall back to local storage
      const localProjects = JSON.parse(localStorage.getItem('projects') || '[]')
      setProjects(localProjects)
      setError('Unable to fetch projects from server. Showing cached data.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'draft': { class: 'badge-secondary', label: 'Draft' },
      'submitted': { class: 'badge-warning', label: 'Pending Verification' },
      'under_review': { class: 'badge-info', label: 'Under Review' },
      'verified': { class: 'badge-success', label: 'Verified' },
      'rejected': { class: 'badge-danger', label: 'Rejected' },
      'active': { class: 'badge-primary', label: 'Active' }
    }
    return statusMap[status] || statusMap['submitted']
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">{projects.length} project(s) total</p>
        </div>
        <Link to="/developer/projects/new" className="btn-primary">
          + Create New Project
        </Link>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}
      
      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <span className="text-6xl mb-4 block">🏗️</span>
          <p className="text-xl">No projects yet</p>
          <p className="mt-2">Create your first blue carbon project to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const status = getStatusBadge(project.status || 'submitted')
            return (
              <div key={project.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.title || project.project_name}
                    </h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>🌿 {project.ecosystemType || project.ecosystem_type || 'mangrove'}</span>
                      <span>📏 {project.projectArea || project.area_hectares || 0} hectares</span>
                      <span>💨 {project.estimatedCO2 || project.estimated_co2_sequestration || 0} tCO₂e/year</span>
                    </div>
                    {(project.location || project.locationAddress) && (
                      <div className="mt-2 text-sm text-gray-500">
                        📍 {project.location || project.locationAddress}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <span className={`badge ${status.class}`}>
                      {status.label}
                    </span>
                    <span className="text-xs text-gray-500 mt-2">
                      Created: {formatDate(project.submittedAt || project.created_at)}
                    </span>
                    <Link 
                      to={`/developer/projects/${project.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const CreateProject = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ecosystemType: 'mangrove',
    projectArea: '',
    estimatedCO2: '',
    locationAddress: '',
    latitude: '',
    longitude: '',
    startDate: '',
    endDate: '',
    restorationDetails: '',
    methodologyDetails: '',
    communityImpact: '',
    biodiversityImpact: '',
    monitoringPlan: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setUploadedFiles(files)
    toast.info(`${files.length} file(s) selected for upload`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!formData.title || !formData.description || !formData.projectArea || !formData.estimatedCO2) {
      toast.error('Please fill in all required fields')
      setLoading(false)
      return
    }

    // Additional validations
    if (parseFloat(formData.projectArea) <= 0) {
      toast.error('Project area must be greater than 0')
      setLoading(false)
      return
    }

    if (parseFloat(formData.estimatedCO2) <= 0) {
      toast.error('Estimated CO2 sequestration must be greater than 0')
      setLoading(false)
      return
    }

    if (formData.latitude && (parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90)) {
      toast.error('Latitude must be between -90 and 90')
      setLoading(false)
      return
    }

    if (formData.longitude && (parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180)) {
      toast.error('Longitude must be between -180 and 180')
      setLoading(false)
      return
    }

    try {
      // Get auth token
      const token = localStorage.getItem('token')
      
      // Prepare project data
      const projectData = {
        project_name: formData.title,
        description: formData.description,
        ecosystem_type: formData.ecosystemType,
        area_hectares: parseFloat(formData.projectArea),
        estimated_co2_sequestration: parseFloat(formData.estimatedCO2),
        location: formData.locationAddress || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        restoration_details: formData.restorationDetails || null,
        methodology_details: formData.methodologyDetails || null,
        community_impact: formData.communityImpact || null,
        biodiversity_impact: formData.biodiversityImpact || null,
        monitoring_plan: formData.monitoringPlan || null,
        status: 'submitted'
      }

      // Submit to backend API
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      // Store project locally for quick access
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      projects.push({
        ...formData,
        id: result.data?.id || Date.now(),
        status: 'submitted',
        submittedAt: new Date().toISOString()
      })
      localStorage.setItem('projects', JSON.stringify(projects))

      toast.success('Project submitted successfully! You will be notified after verification.')
      
      // Redirect to projects list
      setTimeout(() => {
        navigate('/developer/projects')
      }, 1500)
      
    } catch (error) {
      console.error('Error submitting project:', error)
      toast.error(error.message || 'Failed to submit project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600">Submit your blue carbon project for verification</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input mt-1"
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input mt-1"
                placeholder="Describe your blue carbon project"
                required
              />
            </div>

            <div>
              <label htmlFor="ecosystemType" className="block text-sm font-medium text-gray-700">
                Ecosystem Type *
              </label>
              <select
                id="ecosystemType"
                name="ecosystemType"
                value={formData.ecosystemType}
                onChange={handleChange}
                className="input mt-1"
                required
              >
                <option value="mangrove">Mangrove</option>
                <option value="seagrass">Seagrass</option>
                <option value="salt_marsh">Salt Marsh</option>
                <option value="mixed">Mixed Ecosystem</option>
              </select>
            </div>

            <div>
              <label htmlFor="projectArea" className="block text-sm font-medium text-gray-700">
                Project Area (hectares) *
              </label>
              <input
                type="number"
                id="projectArea"
                name="projectArea"
                value={formData.projectArea}
                onChange={handleChange}
                className="input mt-1"
                placeholder="e.g., 100"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Carbon Sequestration */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Carbon Sequestration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimatedCO2" className="block text-sm font-medium text-gray-700">
                Estimated CO₂ Sequestration (tCO₂e/year) *
              </label>
              <input
                type="number"
                id="estimatedCO2"
                name="estimatedCO2"
                value={formData.estimatedCO2}
                onChange={handleChange}
                className="input mt-1"
                placeholder="e.g., 500"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Project Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700">
                Location Address
              </label>
              <input
                type="text"
                id="locationAddress"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleChange}
                className="input mt-1"
                placeholder="Enter project location"
              />
            </div>

            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="input mt-1"
                placeholder="e.g., 23.8103"
                step="0.0001"
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="input mt-1"
                placeholder="e.g., 90.4125"
                step="0.0001"
              />
            </div>
          </div>
        </div>

        {/* Restoration Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Restoration Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="restorationDetails" className="block text-sm font-medium text-gray-700">
                Restoration Plan
              </label>
              <textarea
                id="restorationDetails"
                name="restorationDetails"
                value={formData.restorationDetails}
                onChange={handleChange}
                rows={4}
                className="input mt-1"
                placeholder="Describe your restoration methodology, timeline, and expected outcomes"
              />
            </div>

            <div>
              <label htmlFor="methodologyDetails" className="block text-sm font-medium text-gray-700">
                Methodology Details
              </label>
              <textarea
                id="methodologyDetails"
                name="methodologyDetails"
                value={formData.methodologyDetails}
                onChange={handleChange}
                rows={4}
                className="input mt-1"
                placeholder="Explain the scientific methodology for carbon measurement and monitoring"
              />
            </div>

            <div>
              <label htmlFor="monitoringPlan" className="block text-sm font-medium text-gray-700">
                Monitoring Plan
              </label>
              <textarea
                id="monitoringPlan"
                name="monitoringPlan"
                value={formData.monitoringPlan}
                onChange={handleChange}
                rows={4}
                className="input mt-1"
                placeholder="Describe how you will monitor and report on project progress"
              />
            </div>
          </div>
        </div>

        {/* Impact Assessment */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Impact Assessment</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="communityImpact" className="block text-sm font-medium text-gray-700">
                Community Impact
              </label>
              <textarea
                id="communityImpact"
                name="communityImpact"
                value={formData.communityImpact}
                onChange={handleChange}
                rows={3}
                className="input mt-1"
                placeholder="Describe the social and economic benefits for local communities"
              />
            </div>

            <div>
              <label htmlFor="biodiversityImpact" className="block text-sm font-medium text-gray-700">
                Biodiversity Impact
              </label>
              <textarea
                id="biodiversityImpact"
                name="biodiversityImpact"
                value={formData.biodiversityImpact}
                onChange={handleChange}
                rows={3}
                className="input mt-1"
                placeholder="Describe the expected impact on local biodiversity and ecosystems"
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">Upload documents</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="text-sm text-gray-600 mt-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                PDF, DOC, DOCX, JPG, PNG up to 10MB each
              </p>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                  <ul className="mt-2 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/developer')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Project'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export const ProjectDetail = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">📊</span>
      <p className="text-xl">Project detail view coming soon</p>
    </div>
  </div>
)

// Verifier pages
export const VerifierDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Verifier Dashboard</h1>
    <p className="text-gray-600">Review and verify blue carbon projects for compliance.</p>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">✅</span>
      <p className="text-xl">Verification dashboard coming soon</p>
    </div>
  </div>
)

export const VerificationQueue = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">📋</span>
      <p className="text-xl">No projects in queue</p>
    </div>
  </div>
)

export const VerifyProject = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Verify Project</h1>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">🔍</span>
      <p className="text-xl">Project verification form coming soon</p>
    </div>
  </div>
)

// Admin pages
export const AdminDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
    <p className="text-gray-600">System administration and compliance oversight.</p>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">⚙️</span>
      <p className="text-xl">Admin dashboard coming soon</p>
    </div>
  </div>
)

export const UserManagement = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">👥</span>
      <p className="text-xl">User management coming soon</p>
    </div>
  </div>
)

export const SystemSettings = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">⚙️</span>
      <p className="text-xl">System settings coming soon</p>
    </div>
  </div>
)

export const ComplianceReporting = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Compliance Reporting</h1>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">📈</span>
      <p className="text-xl">Compliance reporting coming soon</p>
    </div>
  </div>
)

// Buyer pages
export const BuyerDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
    <p className="text-gray-600">Discover and purchase verified blue carbon credits.</p>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">💼</span>
      <p className="text-xl">Buyer dashboard coming soon</p>
    </div>
  </div>
)

export const MyCreditPortfolio = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">My Credit Portfolio</h1>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">💼</span>
      <p className="text-xl">Credit portfolio coming soon</p>
    </div>
  </div>
)

export const BrowseCredits = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Browse Credits</h1>
    <div className="text-center py-16 text-gray-500">
      <span className="text-6xl mb-4 block">🛒</span>
      <p className="text-xl">Credit browsing coming soon</p>
    </div>
  </div>
)