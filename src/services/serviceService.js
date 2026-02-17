import api from '../app/api'

const serviceService = {
  getAll: async () => {
    const response = await api.get('/services')
    return response.data.data
  },

  getActive: async () => {
    const response = await api.get('/services/active')
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/services/${id}`)
    return response.data.data
  },

  getByCategory: async (category) => {
    const response = await api.get(`/services/category/${category}`)
    return response.data.data
  },

  getClothTypes: async () => {
    const response = await api.get('/services/cloth-types')
    return response.data.data
  },

  create: async (data) => {
    const response = await api.post('/services', data)
    return response.data.data
  },

  update: async (id, data) => {
    const response = await api.put(`/services/${id}`, data)
    return response.data.data
  },

  toggle: async (id) => {
    const response = await api.patch(`/services/${id}/toggle`)
    return response.data.data
  },

  delete: async (id) => {
    const response = await api.delete(`/services/${id}`)
    return response.data
  }
}

export default serviceService
