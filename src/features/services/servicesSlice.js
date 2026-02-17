import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import serviceService from '../../services/serviceService'

const initialState = {
  services: [],
  clothTypes: { grouped: {}, all: [] },
  isLoading: false,
  error: null
}

export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await serviceService.getAll()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services')
    }
  }
)

export const fetchActiveServices = createAsyncThunk(
  'services/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await serviceService.getActive()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services')
    }
  }
)

export const fetchClothTypes = createAsyncThunk(
  'services/fetchClothTypes',
  async (_, { rejectWithValue }) => {
    try {
      return await serviceService.getClothTypes()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cloth types')
    }
  }
)

export const createService = createAsyncThunk(
  'services/create',
  async (data, { rejectWithValue }) => {
    try {
      return await serviceService.create(data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create service')
    }
  }
)

export const updateService = createAsyncThunk(
  'services/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await serviceService.update(id, data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service')
    }
  }
)

export const toggleService = createAsyncThunk(
  'services/toggle',
  async (id, { rejectWithValue }) => {
    try {
      return await serviceService.toggle(id)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle service')
    }
  }
)

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false
        state.services = action.payload
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchActiveServices.fulfilled, (state, action) => {
        state.services = action.payload
      })
      .addCase(fetchClothTypes.fulfilled, (state, action) => {
        state.clothTypes = action.payload
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.services.push(action.payload)
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.services[index] = action.payload
        }
      })
      .addCase(toggleService.fulfilled, (state, action) => {
        const index = state.services.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.services[index] = action.payload
        }
      })
  }
})

export const { clearError } = servicesSlice.actions
export default servicesSlice.reducer
