import { useSelector, useDispatch } from 'react-redux'
import { login, logout, getCurrentUser, clearError } from '../features/auth/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth)

  const handleLogin = async (email, password) => {
    return dispatch(login({ email, password })).unwrap()
  }

  const handleLogout = async () => {
    return dispatch(logout())
  }

  const handleGetCurrentUser = async () => {
    return dispatch(getCurrentUser())
  }

  const handleClearError = () => {
    dispatch(clearError())
  }

  const hasRole = (...roles) => {
    return user && roles.includes(user.role)
  }

  const isAdmin = () => hasRole('admin')
  const isManager = () => hasRole('admin', 'manager')

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    getCurrentUser: handleGetCurrentUser,
    clearError: handleClearError,
    hasRole,
    isAdmin,
    isManager
  }
}
