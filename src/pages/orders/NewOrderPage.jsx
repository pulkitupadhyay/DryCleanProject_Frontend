import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CheckIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { fetchActiveServices, fetchClothTypes } from '../../features/services/servicesSlice'
import { createOrder } from '../../features/orders/ordersSlice'
import { Card, Button, Input, Select, Modal, Badge } from '../../components/common'
import CustomerSearch from '../../components/customers/CustomerSearch'
import CustomerForm from '../../components/forms/CustomerForm'
import { createCustomer } from '../../features/customers/customersSlice'
import { formatCurrency } from '../../utils/formatters'
import { PAYMENT_MODES } from '../../utils/constants'
import toast from 'react-hot-toast'

const steps = ['Customer', 'Items', 'Payment']

const NewOrderPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { services, clothTypes } = useSelector((state) => state.services)

  const [currentStep, setCurrentStep] = useState(0)
  const [customer, setCustomer] = useState(null)
  const [items, setItems] = useState([])
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [initialPhone, setInitialPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Payment details
  const [paymentMode, setPaymentMode] = useState('cash')
  const [amountPaid, setAmountPaid] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    dispatch(fetchActiveServices())
    dispatch(fetchClothTypes())
  }, [dispatch])

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const totalAmount = subtotal - discount
  const amountDue = totalAmount - amountPaid

  // Step 1: Customer Selection
  const handleCustomerSelect = (selectedCustomer) => {
    setCustomer(selectedCustomer)
    setCurrentStep(1)
  }

  const handleCreateNewCustomer = (phoneQuery) => {
    setInitialPhone(phoneQuery.startsWith('+91') ? phoneQuery : '')
    setShowCustomerModal(true)
  }

  const handleCustomerCreated = async (data) => {
    try {
      const newCustomer = await dispatch(createCustomer(data)).unwrap()
      toast.success('Customer created')
      setCustomer(newCustomer)
      setShowCustomerModal(false)
      setCurrentStep(1)
    } catch (error) {
      toast.error(error || 'Failed to create customer')
    }
  }

  // Step 2: Add Items
  const [newItem, setNewItem] = useState({
    serviceId: '',
    clothType: '',
    quantity: 1,
    pricingType: 'single',
    notes: ''
  })

  const getSelectedService = () => services.find(s => s._id === newItem.serviceId)

  const handleAddItem = () => {
    const service = getSelectedService()
    if (!service || !newItem.clothType) {
      toast.error('Please select service and cloth type')
      return
    }

    const unitPrice = newItem.pricingType === 'pair' ? service.pricing.pair : service.pricing.single
    const item = {
      id: Date.now(),
      serviceId: service._id,
      serviceName: service.name,
      serviceCode: service.code,
      clothType: newItem.clothType,
      quantity: newItem.quantity,
      pricingType: newItem.pricingType,
      unitPrice,
      totalPrice: unitPrice * newItem.quantity,
      notes: newItem.notes
    }

    setItems([...items, item])
    setNewItem({ serviceId: '', clothType: '', quantity: 1, pricingType: 'single', notes: '' })
  }

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  // Step 3: Payment & Submit
  const handleSubmit = async () => {
    if (!customer || items.length === 0) {
      toast.error('Please complete all steps')
      return
    }

    setIsSubmitting(true)
    try {
      const orderData = {
        customerId: customer._id,
        items: items.map(item => ({
          serviceId: item.serviceId,
          clothType: item.clothType,
          quantity: item.quantity,
          pricingType: item.pricingType,
          notes: item.notes
        })),
        discount,
        discountType: 'fixed',
        paymentMode,
        amountPaid: Number(amountPaid),
        notes
      }

      const order = await dispatch(createOrder(orderData)).unwrap()
      toast.success(`Order ${order.orderNumber} created!`)
      navigate(`/orders/${order._id}`)
    } catch (error) {
      toast.error(error || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
        <p className="text-gray-500 mt-1">Create a new order for a customer</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStep ? <CheckIcon className="w-5 h-5" /> : index + 1}
            </div>
            <span className={`ml-2 text-sm ${index === currentStep ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {step}
            </span>
            {index < steps.length - 1 && <div className="w-12 h-0.5 bg-gray-200 mx-4" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Select Customer</h2>
          {customer ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">{customer.name}</p>
                <p className="text-sm text-green-700">{customer.phone}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setCustomer(null)}>
                Change
              </Button>
            </div>
          ) : (
            <CustomerSearch onSelect={handleCustomerSelect} onCreateNew={handleCreateNewCustomer} />
          )}
          {customer && (
            <div className="flex justify-end mt-4">
              <Button onClick={() => setCurrentStep(1)}>Continue to Items</Button>
            </div>
          )}
        </Card>
      )}

      {currentStep === 1 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Add Items</h2>

          {/* Add item form */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <Select
              label="Service"
              value={newItem.serviceId}
              onChange={(e) => setNewItem({ ...newItem, serviceId: e.target.value })}
              options={services.map(s => ({ value: s._id, label: `${s.name} (${s.code})` }))}
              className="md:col-span-2"
            />
            <Select
              label="Cloth Type"
              value={newItem.clothType}
              onChange={(e) => setNewItem({ ...newItem, clothType: e.target.value })}
              options={clothTypes.all?.map(c => ({ value: c, label: c })) || []}
              className="md:col-span-2"
            />
            <Input
              label="Qty"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
              min="1"
            />
            <Select
              label="Type"
              value={newItem.pricingType}
              onChange={(e) => setNewItem({ ...newItem, pricingType: e.target.value })}
              options={[{ value: 'single', label: 'Single' }, { value: 'pair', label: 'Pair' }]}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            {getSelectedService() && (
              <p className="text-sm text-gray-500">
                Price: {formatCurrency(newItem.pricingType === 'pair' ? getSelectedService().pricing.pair : getSelectedService().pricing.single)} x {newItem.quantity} = {formatCurrency((newItem.pricingType === 'pair' ? getSelectedService().pricing.pair : getSelectedService().pricing.single) * newItem.quantity)}
              </p>
            )}
            <Button icon={PlusIcon} size="sm" onClick={handleAddItem}>Add Item</Button>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="border rounded-lg divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.clothType}</span>
                      <Badge variant="primary" size="sm">{item.serviceCode}</Badge>
                      <Badge variant="default" size="sm">{item.pricingType}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.unitPrice)} x {item.quantity} = {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <div className="p-3 bg-gray-50 flex justify-between font-semibold">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="secondary" onClick={() => setCurrentStep(0)}>Back</Button>
            <Button onClick={() => setCurrentStep(2)} disabled={items.length === 0}>Continue to Payment</Button>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Payment & Confirm</h2>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <p className="text-sm text-gray-600">Customer: {customer?.name} ({customer?.phone})</p>
            <p className="text-sm text-gray-600">Items: {items.length} ({items.reduce((s, i) => s + i.quantity, 0)} pcs)</p>
            <div className="mt-3 pt-3 border-t space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Discount (₹)"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              min="0"
            />
            <Select
              label="Payment Mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              options={PAYMENT_MODES}
            />
            <Input
              label="Amount Paid (₹)"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Math.max(0, Number(e.target.value)))}
              min="0"
            />
            <div className="flex items-end">
              <div className="p-3 bg-yellow-50 rounded-lg w-full">
                <p className="text-sm text-yellow-700">Amount Due</p>
                <p className="text-xl font-bold text-yellow-900">{formatCurrency(amountDue)}</p>
              </div>
            </div>
          </div>

          <Input
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions..."
          />

          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => setCurrentStep(1)}>Back</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>Create Order</Button>
          </div>
        </Card>
      )}

      {/* Create Customer Modal */}
      <Modal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="New Customer" size="lg">
        <CustomerForm
          initialData={initialPhone ? { phone: initialPhone } : null}
          onSubmit={handleCustomerCreated}
          onCancel={() => setShowCustomerModal(false)}
        />
      </Modal>
    </div>
  )
}

export default NewOrderPage
