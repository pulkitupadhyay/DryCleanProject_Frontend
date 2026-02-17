import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import {
  fetchCustomerById,
  fetchCustomerOrders,
  updateCustomer,
  addAdvancePayment,
  clearSelectedCustomer
} from '../../features/customers/customersSlice'
import { Card, Button, Badge, Modal, Input, Select, Table, Spinner } from '../../components/common'
import CustomerForm from '../../components/forms/CustomerForm'
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters'
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, PAYMENT_MODES } from '../../utils/constants'
import toast from 'react-hot-toast'

const CustomerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedCustomer: customer, customerOrders, ordersPagination, isLoading } = useSelector(
    (state) => state.customers
  )

  const [showEditModal, setShowEditModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showAdvanceModal, setShowAdvanceModal] = useState(false)
  const [advanceAmount, setAdvanceAmount] = useState('')
  const [advancePaymentMode, setAdvancePaymentMode] = useState('cash')
  const [advanceNotes, setAdvanceNotes] = useState('')
  const [isAddingAdvance, setIsAddingAdvance] = useState(false)

  useEffect(() => {
    dispatch(fetchCustomerById(id))
    dispatch(fetchCustomerOrders({ id, page: 1, limit: 10 }))

    return () => {
      dispatch(clearSelectedCustomer())
    }
  }, [dispatch, id])

  const handleUpdate = async (data) => {
    setIsUpdating(true)
    try {
      await dispatch(updateCustomer({ id: customer._id, data })).unwrap()
      toast.success('Customer updated successfully')
      setShowEditModal(false)
    } catch (error) {
      toast.error(error || 'Failed to update customer')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddAdvance = async () => {
    const amount = Number(advanceAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsAddingAdvance(true)
    try {
      await dispatch(addAdvancePayment({
        id: customer._id,
        data: {
          amount,
          paymentMode: advancePaymentMode,
          notes: advanceNotes
        }
      })).unwrap()
      toast.success('Advance payment added successfully')
      setShowAdvanceModal(false)
      setAdvanceAmount('')
      setAdvanceNotes('')
      dispatch(fetchCustomerById(id)) // Refresh customer data
    } catch (error) {
      toast.error(error || 'Failed to add advance payment')
    } finally {
      setIsAddingAdvance(false)
    }
  }

  const handleOrdersPageChange = (page) => {
    dispatch(fetchCustomerOrders({ id, page, limit: 10 }))
  }

  if (isLoading && !customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
        <Button variant="secondary" onClick={() => navigate('/customers')} className="mt-4">
          Back to Customers
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-500 mt-1">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={PencilIcon} onClick={() => setShowEditModal(true)}>
            Edit
          </Button>
          <Button icon={PlusIcon} onClick={() => navigate('/orders/new')}>
            New Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <span>{formatPhone(customer.phone)}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
              )}
              {(customer.address?.street || customer.address?.city) && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="text-gray-600">
                    {customer.address.street && <p>{customer.address.street}</p>}
                    {customer.address.locality && <p>{customer.address.locality}</p>}
                    {(customer.address.city || customer.address.pincode) && (
                      <p>
                        {customer.address.city}
                        {customer.address.pincode && ` - ${customer.address.pincode}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Preferences */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Payment Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Preference</span>
                <span className="font-medium capitalize">{customer.paymentPreference}</span>
              </div>
              {customer.paymentPreference === 'credit' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Credit Limit</span>
                  <span className="font-medium">{formatCurrency(customer.creditLimit)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-gray-500">Current Balance</span>
                <Badge
                  variant={customer.currentBalance > 0 ? 'success' : customer.currentBalance < 0 ? 'danger' : 'default'}
                >
                  {customer.currentBalance > 0 ? '+' : ''}
                  {formatCurrency(customer.currentBalance)}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">
                {customer.currentBalance > 0
                  ? 'Customer has advance balance'
                  : customer.currentBalance < 0
                  ? 'Customer owes this amount'
                  : 'No outstanding balance'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={BanknotesIcon}
                onClick={() => setShowAdvanceModal(true)}
                className="w-full mt-2"
              >
                Add Advance Payment
              </Button>
            </div>
          </Card>

          {/* Stats */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {customer.stats?.totalOrders || 0}
                </p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(customer.stats?.totalSpent || 0)}
                </p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
            </div>
            {customer.stats?.lastOrderDate && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Last order: {formatDate(customer.stats.lastOrderDate)}
              </p>
            )}
          </Card>

          {/* Notes */}
          {customer.notes && (
            <Card>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-600">{customer.notes}</p>
            </Card>
          )}

          {/* WhatsApp Status */}
          <Card>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">WhatsApp Notifications</span>
              <Badge variant={customer.whatsappOptIn ? 'success' : 'default'}>
                {customer.whatsappOptIn ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Right Column - Order History */}
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Order History</h3>
            </div>
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Order #</Table.Header>
                  <Table.Header>Date</Table.Header>
                  <Table.Header>Items</Table.Header>
                  <Table.Header>Total</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Payment</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {customerOrders.length === 0 ? (
                  <Table.Empty message="No orders found" colSpan={6} />
                ) : (
                  customerOrders.map((order) => {
                    const statusConfig = ORDER_STATUS_CONFIG[order.status]
                    const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus]
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
                        <Table.Cell>{formatDate(order.createdAt)}</Table.Cell>
                        <Table.Cell>
                          {order.items?.length || 0} items ({itemCount} pcs)
                        </Table.Cell>
                        <Table.Cell>
                          <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
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
                      </Table.Row>
                    )
                  })
                )}
              </Table.Body>
            </Table>

            {/* Pagination */}
            {ordersPagination && ordersPagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Page {ordersPagination.page} of {ordersPagination.pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={ordersPagination.page === 1}
                    onClick={() => handleOrdersPageChange(ordersPagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={ordersPagination.page === ordersPagination.pages}
                    onClick={() => handleOrdersPageChange(ordersPagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Customer"
        size="lg"
      >
        <CustomerForm
          initialData={customer}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditModal(false)}
          isLoading={isUpdating}
        />
      </Modal>

      {/* Add Advance Modal */}
      <Modal
        isOpen={showAdvanceModal}
        onClose={() => {
          setShowAdvanceModal(false)
          setAdvanceAmount('')
          setAdvanceNotes('')
        }}
        title="Add Advance Payment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-gray-500">Current Balance: {formatCurrency(customer.currentBalance)}</p>
          </div>

          <Input
            label="Amount (₹)"
            type="number"
            value={advanceAmount}
            onChange={(e) => setAdvanceAmount(e.target.value)}
            min="1"
          />

          <Select
            label="Payment Mode"
            value={advancePaymentMode}
            onChange={(e) => setAdvancePaymentMode(e.target.value)}
            options={PAYMENT_MODES.filter(m => m.value !== 'credit' && m.value !== 'advance')}
          />

          <Input
            label="Notes (Optional)"
            value={advanceNotes}
            onChange={(e) => setAdvanceNotes(e.target.value)}
            placeholder="Reference or notes..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAdvanceModal(false)
                setAdvanceAmount('')
                setAdvanceNotes('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAdvance} loading={isAddingAdvance}>
              Add Advance
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CustomerDetailPage
