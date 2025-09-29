import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const LandingPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Blue Carbon Credit Registry
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A blockchain-based platform for Blue Carbon Credit Registry, MRV (Monitoring, Reporting, Verification), and Marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary px-8 py-3 text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/registry"
                  className="btn-outline px-8 py-3 text-lg"
                >
                  Browse Registry
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Blue Carbon Lifecycle
            </h2>
            <p className="text-lg text-gray-600">
              From project registration to credit retirement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Data Collection</h3>
              <p className="text-gray-600">
                Project developers upload restoration details and IoT sensor data from NCCR infrastructure
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verification</h3>
              <p className="text-gray-600">
                On-field verifiers review projects and NCCR data for compliance and accuracy
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🪙</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tokenization</h3>
              <p className="text-gray-600">
                Smart contracts create token batches with IPFS metadata (1 CCT = 1 tonne CO₂)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Marketplace</h3>
              <p className="text-gray-600">
                Open marketplace for buying credits with full auditability and retirement certificates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Role-Based Access
            </h2>
            <p className="text-lg text-gray-600">
              Different dashboards for each participant in the ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🏗️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Developer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Register projects, upload MRV data, track verification status
              </p>
              {!user && (
                <Link
                  to="/register?role=developer"
                  className="text-primary-600 text-sm font-medium hover:text-primary-700"
                >
                  Register as Developer →
                </Link>
              )}
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verifier</h3>
              <p className="text-sm text-gray-600 mb-4">
                Review projects, approve/reject, provide verification signatures
              </p>
              {!user && (
                <Link
                  to="/register?role=verifier"
                  className="text-primary-600 text-sm font-medium hover:text-primary-700"
                >
                  Register as Verifier →
                </Link>
              )}
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">NCCR Admin</h3>
              <p className="text-sm text-gray-600 mb-4">
                Oversee registry, compliance monitoring, national reporting
              </p>
              {!user && (
                <Link
                  to="/register?role=admin"
                  className="text-primary-600 text-sm font-medium hover:text-primary-700"
                >
                  Register as Admin →
                </Link>
              )}
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Buyer/Investor</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse marketplace, purchase credits, retire with certificates
              </p>
              {!user && (
                <Link
                  to="/register?role=buyer"
                  className="text-primary-600 text-sm font-medium hover:text-primary-700"
                >
                  Register as Buyer →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join the future of carbon credit trading with blockchain technology
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Create Your Account
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default LandingPage