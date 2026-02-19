import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '../components/layout'
import PrivateRoute from './PrivateRoute'
import { PageSpinner } from '../components/common/Spinner'

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))

// Placeholder pages (to be implemented)
const OrdersListPage = lazy(() => import('../pages/orders/OrdersListPage'))
const NewOrderPage = lazy(() => import('../pages/orders/NewOrderPage'))
const OrderDetailPage = lazy(() => import('../pages/orders/OrderDetailPage'))
const CustomersListPage = lazy(() => import('../pages/customers/CustomersListPage'))
const CustomerDetailPage = lazy(() => import('../pages/customers/CustomerDetailPage'))
const ServicesListPage = lazy(() => import('../pages/services/ServicesListPage'))
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'))
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'))
const HomePage = lazy(() => import('../pages/home/homepage'))
const ServicesPage = lazy(()=>import('../pages/home/Services'))
const PrivacyPolicy = lazy(()=>import('../pages/home/PrivacyPolicy'))
const TermsPage  = lazy(()=>import('../pages/home/Terms'))


const AppRoutes = () => {
  return (
    <Suspense fallback={<PageSpinner />}>
     
      <Routes>
        {/* Public routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Orders */}
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/new" element={<NewOrderPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />

          {/* Customers */}
          <Route path="customers" element={<CustomersListPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />

          {/* Services (admin/manager only) */}
          <Route
            path="services"
            element={
              <PrivateRoute roles={['admin', 'manager']}>
                <ServicesListPage />
              </PrivateRoute>
            }
          />

          {/* Reports (admin/manager only) */}
          <Route
            path="reports"
            element={
              <PrivateRoute roles={['admin', 'manager']}>
                <ReportsPage />
              </PrivateRoute>
            }
          />

          {/* Settings (admin only) */}
          <Route
            path="settings"
            element={
              <PrivateRoute roles={['admin']}>
                <SettingsPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
