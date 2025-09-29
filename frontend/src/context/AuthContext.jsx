import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

// Configure axios defaults
axios.defaults.baseURL = API_URL

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        error: null 
      }
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload, user: null, token: null }
    case 'LOGOUT':
      return { ...state, user: null, token: null, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  })

  // Set axios auth header when token changes
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
      localStorage.setItem('token', state.token)
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [state.token])

  // Load user on app start if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        dispatch({ type: 'SET_LOADING', payload: true })
        try {
          const response = await axios.get('/auth/me')
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { 
              user: response.data.data.user, 
              token 
            } 
          })
        } catch (error) {
          dispatch({ type: 'LOGOUT' })
        }
      }
    }
    loadUser()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await axios.post('/auth/login', { email, password })
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: response.data.data 
      })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await axios.post('/auth/register', userData)
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: response.data.data 
      })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    ...state,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}