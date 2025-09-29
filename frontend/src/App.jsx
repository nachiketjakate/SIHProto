import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Layout components
import Layout from './components/Layout/Layout'
import PublicLayout from './components/Layout/PublicLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import { 
  PublicRegistry, 
  Marketplace,
  ProjectList,
  CreateProject,
  ProjectDetail,
  VerifierDashboard,
  VerificationQueue,
  VerifyProject,
  AdminDashboard,
  UserManagement,
  SystemSettings,
  ComplianceReporting,
  BuyerDashboard,
  MyCreditPortfolio,
  BrowseCredits
} from './pages/PlaceholderPages'

// Protected pages - Developer
import DeveloperDashboard from './pages/developer/DeveloperDashboard'

// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Main dashboard route based on user role
const DashboardRoute = () => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case 'developer':
      return <Navigate to="/developer" replace />
    case 'verifier':
      return <Navigate to="/verifier" replace />
    case 'admin':
      return <Navigate to="/admin" replace />
    case 'buyer':
      return <Navigate to="/buyer" replace />
    default:
      return <Navigate to="/" replace />
  }
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="registry" element={<PublicRegistry />} />
          <Route path="marketplace" element={<Marketplace />} />
        </Route>

        {/* Protected routes */}
        <Route path="/dashboard" element={<DashboardRoute />} />

        {/* Developer routes */}
        <Route
          path="/developer"
          element={
            <ProtectedRoute requiredRole="developer">
              <Layout userRole="developer" />
            </ProtectedRoute>
          }
        >
          <Route index element={<DeveloperDashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
        </Route>

        {/* Verifier routes */}
        <Route
          path="/verifier"
          element={
            <ProtectedRoute requiredRole="verifier">
              <Layout userRole="verifier" />
            </ProtectedRoute>
          }
        >
          <Route index element={<VerifierDashboard />} />
          <Route path="queue" element={<VerificationQueue />} />
          <Route path="verify/:id" element={<VerifyProject />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout userRole="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="compliance" element={<ComplianceReporting />} />
        </Route>

        {/* Buyer routes */}
        <Route
          path="/buyer"
          element={
            <ProtectedRoute requiredRole="buyer">
              <Layout userRole="buyer" />
            </ProtectedRoute>
          }
        >
          <Route index element={<BuyerDashboard />} />
          <Route path="portfolio" element={<MyCreditPortfolio />} />
          <Route path="browse" element={<BrowseCredits />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App