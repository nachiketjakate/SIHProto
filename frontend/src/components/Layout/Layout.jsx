import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useWeb3 } from '../../context/Web3Context'

const Layout = ({ userRole }) => {
  const { user, logout } = useAuth()
  const { account, connectWallet, disconnectWallet, connected } = useWeb3()
  const location = useLocation()

  const navigation = {
    developer: [
      { name: 'Dashboard', href: '/developer', icon: '📊' },
      { name: 'Projects', href: '/developer/projects', icon: '🏗️' },
      { name: 'New Project', href: '/developer/projects/new', icon: '➕' },
    ],
    verifier: [
      { name: 'Dashboard', href: '/verifier', icon: '📊' },
      { name: 'Verification Queue', href: '/verifier/queue', icon: '📋' },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin', icon: '📊' },
      { name: 'Users', href: '/admin/users', icon: '👥' },
      { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
      { name: 'Compliance', href: '/admin/compliance', icon: '📈' },
    ],
    buyer: [
      { name: 'Dashboard', href: '/buyer', icon: '📊' },
      { name: 'Browse Credits', href: '/buyer/browse', icon: '🛒' },
      { name: 'My Portfolio', href: '/buyer/portfolio', icon: '💼' },
    ]
  }

  const currentNav = navigation[userRole] || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <Link to="/" className="text-xl font-bold text-primary-600">
              Blue Carbon Registry
            </Link>
            <p className="text-sm text-gray-500 mt-1 capitalize">{userRole} Portal</p>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              {currentNav.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`sidebar-link mb-1 ${isActive ? 'active' : ''}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Welcome back, {user?.full_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.organization && `${user.organization} • `}
                  {user?.email}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Web3 Connection */}
                {connected ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                    <button
                      onClick={disconnectWallet}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Connect Wallet
                  </button>
                )}

                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout