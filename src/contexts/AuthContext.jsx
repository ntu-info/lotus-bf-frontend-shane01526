import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('lotus-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Mock login - replace with actual API call
      // const response = await fetch(`${API_BASE}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      // const data = await response.json()
      
      // Mock user data
      const userData = {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      }
      
      localStorage.setItem('lotus-user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, name) => {
    try {
      // Mock registration - replace with actual API call
      const userData = {
        id: Date.now(),
        email,
        name,
        createdAt: new Date().toISOString()
      }
      
      localStorage.setItem('lotus-user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('lotus-user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
