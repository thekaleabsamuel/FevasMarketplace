import React, { createContext, useContext, useState } from 'react'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)

  // Hardcoded admin credentials
  const ADMIN_CREDENTIALS = {
    username: 'fevasadmin',
    password: 'test123'
  }

  const login = (username, password) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true)
      setShowLogin(false)
      return { success: true }
    } else {
      return { success: false, error: 'Invalid credentials' }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
  }

  const toggleLogin = () => {
    setShowLogin(!showLogin)
  }

  const value = {
    isAuthenticated,
    showLogin,
    isCheckingAuth,
    login,
    logout,
    toggleLogin
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
} 