import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import orderService from '../../services/orderService'

const initialState = {
  orders: [],
  selectedOrder: null,
  stats: null,
  pendingPickups: [],
  pagination: null,
  isLoading: false,
  error: null
}

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await orderService.getAll(params)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const fetchOrderStats = createAsyncThunk(
  'orders/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getStats()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

export const fetchPendingPickups = createAsyncThunk(
  'orders/fetchPendingPickups',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getPendingPickups()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending pickups')
    }
  }
)

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.getById(id)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order')
    }
  }
)

export const createOrder = createAsyncThunk(
  'orders/create',
  async (data, { rejectWithValue }) => {
    try {
      return await orderService.create(data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order')
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      return await orderService.updateStatus(id, status, notes)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status')
    }
  }
)

export const recordPayment = createAsyncThunk(
  'orders/recordPayment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await orderService.recordPayment(id, data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record payment')
    }
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null
    },
    clearError: (state) => {
      state.error = null
    },
    orderCreated: (state, action) => {
      state.orders.unshift(action.payload)
    },
    orderUpdated: (state, action) => {
      const index = state.orders.findIndex(o => o._id === action.payload._id)
      if (index !== -1) {
        state.orders[index] = action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      .addCase(fetchPendingPickups.fulfilled, (state, action) => {
        state.pendingPickups = action.payload
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedOrder = action.payload
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload)
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = { ...state.selectedOrder, ...action.payload }
        }
      })
  }
})

export const { clearSelectedOrder, clearError, orderCreated, orderUpdated } = ordersSlice.actions
export default ordersSlice.reducer
