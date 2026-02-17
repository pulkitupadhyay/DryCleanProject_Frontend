import api from '../app/api'

const orderService = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.set('page', params.page)
    if (params.limit) queryParams.set('limit', params.limit)
    if (params.status) queryParams.set('status', params.status)
    if (params.paymentStatus) queryParams.set('paymentStatus', params.paymentStatus)
    if (params.search) queryParams.set('search', params.search)
    if (params.fromDate) queryParams.set('fromDate', params.fromDate)
    if (params.toDate) queryParams.set('toDate', params.toDate)

    const response = await api.get(`/orders?${queryParams.toString()}`)
    return response.data.data
  },

  getStats: async () => {
    const response = await api.get('/orders/stats')
    return response.data.data
  },

  getPendingPickups: async () => {
    const response = await api.get('/orders/pending-pickup')
    return response.data.data
  },

  getByStatus: async (status) => {
    const response = await api.get(`/orders/by-status/${status}`)
    return response.data.data
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data.data
  },

  getByOrderNumber: async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`)
    return response.data.data
  },

  create: async (data) => {
    const response = await api.post('/orders', data)
    return response.data.data
  },

  update: async (id, data) => {
    const response = await api.put(`/orders/${id}`, data)
    return response.data.data
  },

  updateStatus: async (id, status, notes) => {
    const response = await api.patch(`/orders/${id}/status`, { status, notes })
    return response.data.data
  },

  cancel: async (id, reason) => {
    const response = await api.delete(`/orders/${id}`, { data: { reason } })
    return response.data
  },

  recordPayment: async (id, data) => {
    const response = await api.post(`/orders/${id}/payment`, data)
    return response.data.data
  }
}

export default orderService
