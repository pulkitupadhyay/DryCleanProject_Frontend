import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { fetchOrders, fetchOrderStats, fetchPendingPickups } from '../../features/orders/ordersSlice'
import { Card, Button, Spinner } from '../../components/common'
import { RevenueChart, OrdersStatusChart } from '../../components/dashboard'
import { formatCurrency } from '../../utils/formatters'
import { ORDER_STATUS_CONFIG } from '../../utils/constants'
import { useOrderNotifications } from '../../hooks/useOrderNotifications'

const StatCard = ({ name, value, icon: Icon, color, trend, onClick }) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{name}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className="flex items-center mt-1">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-green-600">{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </Card>
)

const DashboardPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { orders, stats, pendingPickups, isLoading } = useSelector((state) => state.orders)

  const refreshData = useCallback(() => {
    dispatch(fetchOrderStats())
    dispatch(fetchPendingPickups())
    dispatch(fetchOrders({ page: 1, limit: 5 }))
  }, [dispatch])

  // Listen for real-time order events and refresh dashboard data
  useOrderNotifications({
    onOrderCreated: refreshData,
    onOrderUpdated: refreshData,
    onPaymentReceived: refreshData,
    showToasts: true
  })

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const statCards = [
    {
      name: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      onClick: () => navigate('/orders')
    },
    {
      name: "Today's Revenue",
      value: formatCurrency(stats?.todayRevenue || 0),
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500',
      onClick: () => navigate('/orders')
    },
    {
      name: 'Pending Pickup',
      value: pendingPickups?.length || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      onClick: () => navigate('/orders?status=ready')
    },
    {
      name: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      onClick: () => navigate('/customers')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your dry cleaning business</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <p className="text-sm text-gray-500">Last 7 days performance</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats?.weekRevenue || 0)}
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <RevenueChart data={stats?.revenueChart || []} />
          )}
        </Card>

        {/* Orders Status Chart */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Orders by Status</h3>
            <p className="text-sm text-gray-500">Active orders breakdown</p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <OrdersStatusChart data={stats?.ordersByStatus || {}} />
          )}
        </Card>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/orders')}
            >
              View All
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders yet</p>
              <Button
                size="sm"
                onClick={() => navigate('/orders/new')}
                className="mt-2"
              >
                Create First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {orders.slice(0, 5).map((order) => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status]
                return (
                  <div
                    key={order._id}
                    className="flex items-center justify-between py-3 px-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customerInfo?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                        {statusConfig?.label}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Pending Pickups */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending Pickups</h3>
            {pendingPickups?.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingPickups.length} orders
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : pendingPickups?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending pickups</p>
              <p className="text-sm text-gray-400 mt-1">All orders have been picked up</p>
            </div>
          ) : (
            <div className="space-y-1">
              {pendingPickups.slice(0, 5).map((order) => {
                const daysReady = order.daysSinceReady || 0

                return (
                  <div
                    key={order._id}
                    className="flex items-center justify-between py-3 px-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customerInfo?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ready
                      </span>
                      <p className={`text-sm mt-1 ${daysReady >= 2 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                        {daysReady === 0 ? 'Ready today' : daysReady === 1 ? 'Ready 1 day' : `Ready ${daysReady} days`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Weekly & Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">This Week</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.weekOrders || 0}</p>
              <p className="text-sm text-blue-600 mt-1">Orders</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.weekRevenue || 0)}</p>
              <p className="text-sm text-green-600 mt-1">Revenue</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">This Month</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{stats?.monthOrders || 0}</p>
              <p className="text-sm text-purple-600 mt-1">Orders</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.monthRevenue || 0)}</p>
              <p className="text-sm text-orange-600 mt-1">Revenue</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
