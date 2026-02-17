import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { fetchOrders, updateOrderStatus } from '../../features/orders/ordersSlice'
import { Card, Button, Table, Badge, Select, Input, Modal } from '../../components/common'
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters'
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, ORDER_STATUS } from '../../utils/constants'
import { useOrderNotifications } from '../../hooks/useOrderNotifications'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'collected', label: 'Collected' },
  { value: 'processing', label: 'Processing' },
  { value: 'washed', label: 'Washed' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
]

const paymentStatusOptions = [
  { value: '', label: 'All Payment Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' }
]

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

const OrdersListPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { orders, pagination, isLoading } = useSelector((state) => state.orders)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusModalOrder, setStatusModalOrder] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const loadOrders = useCallback((page = 1) => {
    const params = { page, limit: 20 }
    if (statusFilter) params.status = statusFilter
    if (paymentFilter) params.paymentStatus = paymentFilter
    dispatch(fetchOrders(params))
  }, [dispatch, statusFilter, paymentFilter])

  // Listen for real-time order events and refresh list
  useOrderNotifications({
    onOrderCreated: () => loadOrders(1),
    onOrderUpdated: () => loadOrders(pagination?.page || 1),
    showToasts: false // Dashboard shows toasts
  })

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handlePageChange = (page) => {
    loadOrders(page)
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status')
      return
    }

    setIsUpdating(true)
    try {
      await dispatch(updateOrderStatus({
        id: statusModalOrder._id,
        status: newStatus,
        notes: statusNotes
      })).unwrap()
      toast.success(`Order status updated to ${ORDER_STATUS_CONFIG[newStatus].label}`)
      setStatusModalOrder(null)
      setNewStatus('')
      setStatusNotes('')
    } catch (error) {
      toast.error(error || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const openStatusModal = (order, e) => {
    e.stopPropagation()
    const nextStatuses = getNextStatuses(order.status)
    if (nextStatuses.length > 0) {
      setStatusModalOrder(order)
      setNewStatus(nextStatuses[0])
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerInfo?.name?.toLowerCase().includes(query) ||
      order.customerInfo?.phone?.includes(query)
    )
  })

  const clearFilters = () => {
    setStatusFilter('')
    setPaymentFilter('')
    setSearchQuery('')
  }

  const hasActiveFilters = statusFilter || paymentFilter || searchQuery

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            {pagination?.total || 0} total orders
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => navigate('/orders/new')}>
          New Order
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer name or phone..."
              className="input pl-10"
            />
          </div>

          {/* Filter toggle */}
          <div className="flex gap-2">
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              icon={FunnelIcon}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary-200 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="secondary" icon={XMarkIcon} onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filter dropdowns */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <Select
              label="Order Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
            <Select
              label="Payment Status"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              options={paymentStatusOptions}
            />
          </div>
        )}
      </Card>

      {/* Orders Table */}
      <Card padding={false}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header>Order #</Table.Header>
              <Table.Header>Customer</Table.Header>
              <Table.Header>Items</Table.Header>
              <Table.Header>Total</Table.Header>
              <Table.Header>Status</Table.Header>
              <Table.Header>Payment</Table.Header>
              <Table.Header>Date</Table.Header>
              <Table.Header></Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={8} className="text-center py-8 text-gray-500">
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : filteredOrders.length === 0 ? (
              <Table.Empty message="No orders found" colSpan={8} />
            ) : (
              filteredOrders.map((order) => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status]
                const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus]
                const nextStatuses = getNextStatuses(order.status)
                const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

                return (
                  <Table.Row
                    key={order._id}
                    clickable
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <Table.Cell>
                      <span className="font-medium text-primary-600">{order.orderNumber}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-medium text-gray-900">{order.customerInfo?.name}</div>
                      <div className="text-sm text-gray-500">{formatPhone(order.customerInfo?.phone)}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-gray-900">{order.items?.length || 0} items</span>
                      <span className="text-gray-500 text-sm ml-1">({itemCount} pcs)</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                      {order.amountDue > 0 && (
                        <div className="text-xs text-red-600">Due: {formatCurrency(order.amountDue)}</div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                        {statusConfig?.label}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentConfig?.color}`}>
                        {paymentConfig?.label}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-gray-900">{formatDate(order.createdAt)}</div>
                      {order.expectedDeliveryDate && (
                        <div className="text-xs text-gray-500">
                          Due: {formatDate(order.expectedDeliveryDate)}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {nextStatuses.length > 0 && (
                        <button
                          onClick={(e) => openStatusModal(order, e)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="Update Status"
                        >
                          <ChevronDownIcon className="w-5 h-5" />
                        </button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Status Update Modal */}
      <Modal
        isOpen={!!statusModalOrder}
        onClose={() => {
          setStatusModalOrder(null)
          setNewStatus('')
          setStatusNotes('')
        }}
        title="Update Order Status"
        size="sm"
      >
        {statusModalOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Order</p>
              <p className="font-medium">{statusModalOrder.orderNumber}</p>
              <p className="text-sm text-gray-500">{statusModalOrder.customerInfo?.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Current Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_CONFIG[statusModalOrder.status]?.color}`}>
                {ORDER_STATUS_CONFIG[statusModalOrder.status]?.label}
              </span>
            </div>

            <Select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={getNextStatuses(statusModalOrder.status).map(s => ({
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
                  setStatusModalOrder(null)
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
        )}
      </Modal>
    </div>
  )
}

export default OrdersListPage
