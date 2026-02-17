import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

const statusColors = {
  collected: {
    bg: 'rgba(59, 130, 246, 0.8)',
    border: 'rgb(59, 130, 246)'
  },
  processing: {
    bg: 'rgba(234, 179, 8, 0.8)',
    border: 'rgb(234, 179, 8)'
  },
  washed: {
    bg: 'rgba(168, 85, 247, 0.8)',
    border: 'rgb(168, 85, 247)'
  },
  ready: {
    bg: 'rgba(34, 197, 94, 0.8)',
    border: 'rgb(34, 197, 94)'
  },
  delivered: {
    bg: 'rgba(107, 114, 128, 0.8)',
    border: 'rgb(107, 114, 128)'
  },
  cancelled: {
    bg: 'rgba(239, 68, 68, 0.8)',
    border: 'rgb(239, 68, 68)'
  }
}

const statusLabels = {
  collected: 'Collected',
  processing: 'Processing',
  washed: 'Washed',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
}

const OrdersStatusChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  // Filter out statuses with 0 orders for cleaner display
  const activeStatuses = ['collected', 'processing', 'washed', 'ready']
  const filteredStatuses = activeStatuses.filter(status => (data[status] || 0) > 0)

  if (filteredStatuses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No active orders
      </div>
    )
  }

  const chartData = {
    labels: filteredStatuses.map(status => statusLabels[status]),
    datasets: [
      {
        data: filteredStatuses.map(status => data[status] || 0),
        backgroundColor: filteredStatuses.map(status => statusColors[status].bg),
        borderColor: filteredStatuses.map(status => statusColors[status].border),
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.raw / total) * 100).toFixed(1)
            return ` ${context.raw} orders (${percentage}%)`
          }
        }
      }
    }
  }

  // Calculate total active orders
  const totalActive = filteredStatuses.reduce((sum, status) => sum + (data[status] || 0), 0)

  return (
    <div className="relative h-64">
      <Doughnut data={chartData} options={options} />
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: '40px' }}>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{totalActive}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
      </div>
    </div>
  )
}

export default OrdersStatusChart
