import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSocket } from '../contexts/SocketContext'
import toast from 'react-hot-toast'

/**
 * Hook to handle real-time order notifications
 * Call this hook in a component that should receive order updates
 */
export const useOrderNotifications = (options = {}) => {
  const { subscribe } = useSocket()
  const dispatch = useDispatch()

  const {
    onOrderCreated,
    onOrderUpdated,
    onPaymentReceived,
    showToasts = true
  } = options

  useEffect(() => {
    const unsubscribeCreated = subscribe('order:created', (data) => {
      if (showToasts) {
        toast.success(data.message || 'New order created', {
          icon: '📦',
          duration: 4000
        })
      }
      if (onOrderCreated) {
        onOrderCreated(data.order)
      }
    })

    const unsubscribeUpdated = subscribe('order:updated', (data) => {
      if (showToasts) {
        const statusColors = {
          processing: '⚙️',
          washed: '🧼',
          ready: '✅',
          delivered: '🚚',
          cancelled: '❌'
        }
        toast.success(data.message || 'Order updated', {
          icon: statusColors[data.newStatus] || '📋',
          duration: 4000
        })
      }
      if (onOrderUpdated) {
        onOrderUpdated(data.order, data.previousStatus, data.newStatus)
      }
    })

    const unsubscribePayment = subscribe('order:payment', (data) => {
      if (showToasts) {
        toast.success(data.message || 'Payment received', {
          icon: '💰',
          duration: 4000
        })
      }
      if (onPaymentReceived) {
        onPaymentReceived(data)
      }
    })

    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribePayment()
    }
  }, [subscribe, onOrderCreated, onOrderUpdated, onPaymentReceived, showToasts])
}

export default useOrderNotifications
