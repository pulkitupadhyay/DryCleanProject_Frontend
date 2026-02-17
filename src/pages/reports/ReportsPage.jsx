import { useEffect, useState } from 'react'
import {
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  TagIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import api from '../../app/api'
import { Card, Spinner } from '../../components/common'
import { formatCurrency } from '../../utils/formatters'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const tabs = [
  { id: 'revenue', name: 'Revenue', icon: CurrencyRupeeIcon },
  { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
  { id: 'services', name: 'Services', icon: TagIcon },
  { id: 'customers', name: 'Customers', icon: UserGroupIcon }
]

const datePresets = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' }
]

const getDateRange = (preset) => {
  const end = new Date()
  let start = new Date()

  switch (preset) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
    case 'month':
      start = new Date(end.getFullYear(), end.getMonth(), 1)
      break
    case 'year':
      start = new Date(end.getFullYear(), 0, 1)
      break
    default:
      start.setDate(end.getDate() - 30)
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  }
}

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('revenue')
  const [datePreset, setDatePreset] = useState('30d')
  const [dateRange, setDateRange] = useState(getDateRange('30d'))
  const [isLoading, setIsLoading] = useState(true)
  const [revenueData, setRevenueData] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [serviceData, setServiceData] = useState(null)
  const [customerData, setCustomerData] = useState(null)

  useEffect(() => {
    setDateRange(getDateRange(datePreset))
  }, [datePreset])

  useEffect(() => {
    fetchReportData()
  }, [activeTab, dateRange])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      const params = { startDate: dateRange.startDate, endDate: dateRange.endDate }

      switch (activeTab) {
        case 'revenue':
          const revenueRes = await api.get('/reports/revenue', { params })
          setRevenueData(revenueRes.data.data)
          break
        case 'orders':
          const orderRes = await api.get('/reports/orders', { params })
          setOrderData(orderRes.data.data)
          break
        case 'services':
          const serviceRes = await api.get('/reports/services', { params })
          setServiceData(serviceRes.data.data)
          break
        case 'customers':
          const customerRes = await api.get('/reports/customers', { params })
          setCustomerData(customerRes.data.data)
          break
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderRevenueTab = () => {
    if (!revenueData) return null

    const chartData = {
      labels: revenueData.chartData.map(d => d.date),
      datasets: [
        {
          label: 'Revenue',
          data: revenueData.chartData.map(d => d.revenue),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Collected',
          data: revenueData.chartData.map(d => d.collected),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'transparent',
          tension: 0.4
        }
      ]
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(revenueData.summary.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Collected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(revenueData.summary.totalCollected)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(revenueData.summary.totalPending)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(revenueData.summary.avgOrderValue)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-80">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => formatCurrency(value)
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>
    )
  }

  const renderOrdersTab = () => {
    if (!orderData) return null

    const statusColors = {
      collected: '#3B82F6',
      processing: '#F59E0B',
      washed: '#8B5CF6',
      ready: '#10B981',
      delivered: '#6B7280',
      cancelled: '#EF4444'
    }

    const statusChartData = {
      labels: Object.keys(orderData.byStatus).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        data: Object.values(orderData.byStatus),
        backgroundColor: Object.keys(orderData.byStatus).map(s => statusColors[s]),
        borderWidth: 0
      }]
    }

    const trendChartData = {
      labels: orderData.dailyTrend.map(d => d.date),
      datasets: [{
        label: 'Orders',
        data: orderData.dailyTrend.map(d => d.orders),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4
      }]
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.values(orderData.byStatus).reduce((a, b) => a + b, 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Avg Processing Time</p>
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(orderData.avgProcessingHours)} hrs
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Pending Payment Amount</p>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(orderData.byPayment?.pending?.amount || 0)}
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right' }
                  }
                }}
              />
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold mb-4">Daily Orders</h3>
            <div className="h-64">
              <Bar
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            </div>
          </Card>
        </div>

        {/* Payment Status Table */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Payment Status Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(orderData.byPayment || {}).map(([status, data]) => (
                  <tr key={status}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'paid' ? 'bg-green-100 text-green-800' :
                        status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{data.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(data.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    )
  }

  const renderServicesTab = () => {
    if (!serviceData || serviceData.length === 0) {
      return (
        <Card>
          <p className="text-gray-500 text-center py-12">No service data available for this period</p>
        </Card>
      )
    }

    const chartData = {
      labels: serviceData.slice(0, 5).map(s => s.name),
      datasets: [{
        label: 'Revenue',
        data: serviceData.slice(0, 5).map(s => s.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderRadius: 4
      }]
    }

    return (
      <div className="space-y-6">
        {/* Top Services Chart */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Top 5 Services by Revenue</h3>
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => formatCurrency(ctx.raw)
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => formatCurrency(value)
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Services Table */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">All Services Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceData.map((service, index) => (
                  <tr key={service.serviceId || index}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{service.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{service.orderCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{service.itemCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                      {formatCurrency(service.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    )
  }

  const renderCustomersTab = () => {
    if (!customerData) return null

    const retentionRate = customerData.activeCustomers > 0
      ? ((customerData.repeatCustomers / customerData.activeCustomers) * 100).toFixed(1)
      : 0

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900">{customerData.totalCustomers}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">New Customers</p>
            <p className="text-3xl font-bold text-green-600">{customerData.newCustomers}</p>
            <p className="text-xs text-gray-400 mt-1">In selected period</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Active Customers</p>
            <p className="text-3xl font-bold text-blue-600">{customerData.activeCustomers}</p>
            <p className="text-xs text-gray-400 mt-1">Ordered in period</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Retention Rate</p>
            <p className="text-3xl font-bold text-purple-600">{retentionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Repeat customers</p>
          </Card>
        </div>

        {/* Top Customers */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Top Customers by Revenue</h3>
          {customerData.topCustomers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No customer data for this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerData.topCustomers.map((customer, index) => (
                    <tr key={customer._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' :
                          'bg-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{customer.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.orderCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    )
  }

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )
    }

    switch (activeTab) {
      case 'revenue':
        return renderRevenueTab()
      case 'orders':
        return renderOrdersTab()
      case 'services':
        return renderServicesTab()
      case 'customers':
        return renderCustomersTab()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Analytics and insights for your business</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="input py-2"
          >
            {datePresets.map(preset => (
              <option key={preset.value} value={preset.value}>{preset.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default ReportsPage
