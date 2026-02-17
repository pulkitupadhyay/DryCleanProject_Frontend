import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import customerService from '../../services/customerService'

const initialState = {
  customers: [],
  selectedCustomer: null,
  customerOrders: [],
  ordersPagination: null,
  searchResults: [],
  pagination: null,
  isLoading: false,
  error: null
}

export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async ({ page, limit } = {}, { rejectWithValue }) => {
    try {
      return await customerService.getAll(page, limit)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers')
    }
  }
)

export const searchCustomers = createAsyncThunk(
  'customers/search',
  async (query, { rejectWithValue }) => {
    try {
      return await customerService.search(query)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed')
    }
  }
)

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await customerService.getById(id)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer')
    }
  }
)

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (data, { rejectWithValue }) => {
    try {
      return await customerService.create(data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer')
    }
  }
)

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await customerService.update(id, data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer')
    }
  }
)

export const fetchCustomerOrders = createAsyncThunk(
  'customers/fetchOrders',
  async ({ id, page, limit }, { rejectWithValue }) => {
    try {
      return await customerService.getOrders(id, page, limit)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const addAdvancePayment = createAsyncThunk(
  'customers/addAdvance',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await customerService.addAdvance(id, data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add advance')
    }
  }
)

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
      state.customerOrders = []
      state.ordersPagination = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers = action.payload.customers
        state.pagination = action.payload.pagination
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.searchResults = action.payload
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedCustomer = action.payload
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload)
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload
        }
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.customerOrders = action.payload.orders
        state.ordersPagination = action.payload.pagination
      })
      .addCase(addAdvancePayment.fulfilled, (state, action) => {
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload
        }
      })
  }
})

export const { clearSearchResults, clearSelectedCustomer, clearError } = customersSlice.actions
export default customersSlice.reducer
