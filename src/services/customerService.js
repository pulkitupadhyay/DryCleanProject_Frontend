import api from '../app/api'

const customerService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await api.get(`/customers?page=${page}&limit=${limit}`)
    return response.data.data
  },

  search: async (query) => {
    const response = await api.get(`/customers/search?q=${encodeURIComponent(query)}`)
    return response.data.data
  },

  getByPhone: async (phone) => {
    const response = await api.get(`/customers/phone/${encodeURIComponent(phone)}`)
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`)
    return response.data.data
  },

  create: async (data) => {
    const response = await api.post('/customers', data)
    return response.data.data
  },

  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data)
    return response.data.data
  },

  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  },

  getOrders: async (id, page = 1, limit = 10) => {
    const response = await api.get(`/customers/${id}/orders?page=${page}&limit=${limit}`)
    return response.data.data
  },

  getPayments: async (id) => {
    const response = await api.get(`/customers/${id}/payments`)
    return response.data.data
  },

  addAdvance: async (id, data) => {
    const response = await api.post(`/customers/${id}/advance`, data)
    return response.data.data
  },

  getBalance: async (id) => {
    const response = await api.get(`/customers/${id}/balance`)
    return response.data.data
  }
}

export default customerService
