import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeftIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  BanknotesIcon,
  PrinterIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { fetchOrderById, updateOrderStatus, recordPayment } from '../../features/orders/ordersSlice'
import { Card, Button, Badge, Modal, Input, Select, Spinner } from '../../components/common'
import { formatCurrency, formatDate, formatPhone, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, PAYMENT_MODES } from '../../utils/constants'
import api from '../../app/api'
import toast from 'react-hot-toast'

const getNextStatuses = (currentStatus) => {
  const statusFlow = {
    collected: ['processing', 'cancelled'],
    processing: ['washed', 'cancelled'],
    washed: ['ready', 'cancelled'],
    ready: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
  }
  return statusFlow[currentStatus] || []
}

const StatusTimeline = ({ history }) => {
  if (!history || history.length === 0) return null

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, idx) => {
          const statusConfig = ORDER_STATUS_CONFIG[event.status]
          const isLast = idx === history.length - 1

          return (
            <li key={idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${statusConfig?.color || 'bg-gray-100'}`}>
                      <CheckCircleIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900 font-medium">
                        {statusConfig?.label}
                      </p>
                      {event.notes && (
                        <p className="text-sm text-gray-500 mt-0.5">{event.notes}</p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {formatDateTime(event.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedOrder: order, isLoading } = useSelector((state) => state.orders)

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState('cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false)

  useEffect(() => {
    dispatch(fetchOrderById(id))
  }, [dispatch, id])

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true)
    try {
      // Determine notification type based on order status
      let notificationType = 'order_collected'
      if (order.status === 'ready') {
        notificationType = 'order_ready'
      } else if (order.status === 'delivered') {
        notificationType = 'order_delivered'
      }

      await api.post(`/whatsapp/send/${order._id}`, { type: notificationType })
      toast.success('WhatsApp notification sent')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send notification'
      toast.error(message)
    } finally {
      setIsSendingWhatsApp(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status')
      return
    }

    setIsUpdating(true)
    try {
      await dispatch(updateOrderStatus({
        id: order._id,
        status: newStatus,
        notes: statusNotes
      })).unwrap()
      toast.success(`Order status updated to ${ORDER_STATUS_CONFIG[newStatus].label}`)
      setShowStatusModal(false)
      setNewStatus('')
      setStatusNotes('')
    } catch (error) {
      toast.error(error || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRecordPayment = async () => {
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > order.amountDue) {
      toast.error(`Amount cannot exceed due amount (${formatCurrency(order.amountDue)})`)
      return
    }

    setIsRecordingPayment(true)
    try {
      await dispatch(recordPayment({
        id: order._id,
        data: {
          amount,
          paymentMode,
          notes: paymentNotes
        }
      })).unwrap()
      toast.success('Payment recorded successfully')
      setShowPaymentModal(false)
      setPaymentAmount('')
      setPaymentNotes('')
      dispatch(fetchOrderById(id)) // Refresh order
    } catch (error) {
      toast.error(error || 'Failed to record payment')
    } finally {
      setIsRecordingPayment(false)
    }
  }

  const openStatusModal = () => {
    const nextStatuses = getNextStatuses(order.status)
    if (nextStatuses.length > 0) {
      setNewStatus(nextStatuses[0])
      setShowStatusModal(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Button variant="secondary" onClick={() => navigate('/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    )
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status]
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus]
  const nextStatuses = getNextStatuses(order.status)
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                {statusConfig?.label}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              Created {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={PrinterIcon}>
            Print Receipt
          </Button>
          {nextStatuses.length > 0 && (
            <Button onClick={openStatusModal}>
              Update Status
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                <Link
                  to={`/customers/${order.customer}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                >
                  {order.customerInfo?.name}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{formatPhone(order.customerInfo?.phone)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Expected Delivery</p>
                <p className="font-medium">
                  {order.expectedDeliveryDate
                    ? formatDate(order.expectedDeliveryDate)
                    : 'Not set'}
                </p>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">
              Items ({order.items?.length || 0})
              <span className="text-gray-500 text-sm font-normal ml-2">
                {itemCount} pieces
              </span>
            </h3>
            <div className="border rounded-lg divide-y">
              {order.items?.map((item, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.clothType}</span>
                      <Badge variant="primary" size="sm">{item.serviceCode || item.service?.code}</Badge>
                      <Badge variant="default" size="sm">{item.pricingType}</Badge>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">
                      {formatCurrency(item.unitPrice)} x {item.quantity}
                    </p>
                    <p className="font-semibold text-primary-600">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Status Timeline */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Status History</h3>
            <StatusTimeline history={order.statusHistory} />
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Payment</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentConfig?.color}`}>
                  {paymentConfig?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-medium">Amount Due</span>
                <span className={`font-semibold text-lg ${order.amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(order.amountDue)}
                </span>
              </div>

              {order.amountDue > 0 && (
                <Button
                  icon={BanknotesIcon}
                  onClick={() => {
                    setPaymentAmount(order.amountDue.toString())
                    setShowPaymentModal(true)
                  }}
                  className="w-full mt-2"
                >
                  Record Payment
                </Button>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {nextStatuses.length > 0 && nextStatuses.map(status => (
                <Button
                  key={status}
                  variant={status === 'cancelled' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => {
                    setNewStatus(status)
                    setShowStatusModal(true)
                  }}
                  className="w-full"
                >
                  Mark as {ORDER_STATUS_CONFIG[status].label}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                icon={ChatBubbleLeftRightIcon}
                onClick={handleSendWhatsApp}
                loading={isSendingWhatsApp}
                className="w-full"
              >
                Send WhatsApp
              </Button>
            </div>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-600">{order.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false)
          setNewStatus('')
          setStatusNotes('')
        }}
        title="Update Order Status"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Order</p>
            <p className="font-medium">{order.orderNumber}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Current Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color}`}>
              {statusConfig?.label}
            </span>
          </div>

          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={nextStatuses.map(s => ({
              value: s,
              label: ORDER_STATUS_CONFIG[s].label
            }))}
          />

          <Input
            label="Notes (Optional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            placeholder="Any notes about this status change..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowStatusModal(false)
                setNewStatus('')
                setStatusNotes('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} loading={isUpdating}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setPaymentAmount('')
          setPaymentNotes('')
        }}
        title="Record Payment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Amount Due</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(order.amountDue)}</p>
          </div>

          <Input
            label="Amount (₹)"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            min="1"
            max={order.amountDue}
          />

          <Select
            label="Payment Mode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            options={PAYMENT_MODES}
          />

          <Input
            label="Notes (Optional)"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Payment reference or notes..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowPaymentModal(false)
                setPaymentAmount('')
                setPaymentNotes('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} loading={isRecordingPayment}>
              Record Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OrderDetailPage
