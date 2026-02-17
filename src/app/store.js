import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import customersReducer from '../features/customers/customersSlice'
import servicesReducer from '../features/services/servicesSlice'
import ordersReducer from '../features/orders/ordersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customersReducer,
    services: servicesReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
