import React from 'react'
import { Link } from 'react-router-dom'

const DeveloperDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
        <p className="text-gray-600">Manage your blue carbon projects and track their progress through the verification process.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Active Projects</h3>
          <div className="text-3xl font-bold text-primary-600">0</div>
          <p className="text-sm text-gray-500">Projects in development</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Under Review</h3>
          <div className="text-3xl font-bold text-yellow-600">0</div>
          <p className="text-sm text-gray-500">Pending verification</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Verified Projects</h3>
          <div className="text-3xl font-bold text-green-600">0</div>
          <p className="text-sm text-gray-500">Ready for tokenization</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/developer/projects/new"
            className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-lg">➕</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">New Project</h3>
              <p className="text-sm text-gray-500">Register a new blue carbon project</p>
            </div>
          </Link>
          
          <Link
            to="/developer/projects"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-lg">🏗️</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">My Projects</h3>
              <p className="text-sm text-gray-500">View and manage your projects</p>
            </div>
          </Link>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg opacity-50">
            <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-lg">📊</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Upload MRV Data</h3>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-4 block">📋</span>
          <p>No recent activity</p>
          <p className="text-sm">Start by creating your first project</p>
        </div>
      </div>
    </div>
  )
}

export default DeveloperDashboard