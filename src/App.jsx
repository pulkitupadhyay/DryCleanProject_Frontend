import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import AppRoutes from './routes'
import { PageSpinner } from './components/common/Spinner'

const App = () => {
  const { isAuthenticated, getCurrentUser, isLoading } = useAuth()

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token && !isAuthenticated) {
      getCurrentUser()
    }
  }, [])

  // Show loading spinner while checking auth
  if (isLoading && localStorage.getItem('accessToken')) {
    return <PageSpinner />
  }

  return <AppRoutes />
}

export default App
