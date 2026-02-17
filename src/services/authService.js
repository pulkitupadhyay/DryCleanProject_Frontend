import api from '../app/api'

const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data.data
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken })
    return response.data.data
  },

  // Logout
  logout: async (refreshToken) => {
    await api.post('/auth/logout', { refreshToken })
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data.data
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/me', data)
    return response.data.data
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data.data
  }
}

export default authService
