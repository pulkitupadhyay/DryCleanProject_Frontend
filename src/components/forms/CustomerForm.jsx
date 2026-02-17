import { useState, useEffect } from 'react'
import { Button, Input, Select } from '../common'
import { formatPhoneInput, isValidIndianPhone } from '../../utils/validators'

const paymentOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit' },
  { value: 'advance', label: 'Advance' }
]

const CustomerForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    address: {
      street: '',
      locality: '',
      city: '',
      pincode: ''
    },
    paymentPreference: 'cash',
    creditLimit: 0,
    whatsappOptIn: true,
    notes: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        phone: initialData.phone || '',
        name: initialData.name || '',
        email: initialData.email || '',
        address: initialData.address || { street: '', locality: '', city: '', pincode: '' },
        paymentPreference: initialData.paymentPreference || 'cash',
        creditLimit: initialData.creditLimit || 0,
        whatsappOptIn: initialData.whatsappOptIn !== false,
        notes: initialData.notes || ''
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: formatPhoneInput(value) }))
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }))
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when field changes
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    } else if (!isValidIndianPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number'
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          error={errors.phone}
          required
          disabled={!!initialData?.phone}
        />

        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter customer name"
          error={errors.name}
          required
        />
      </div>

      <Input
        label="Email (Optional)"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="customer@email.com"
        error={errors.email}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Street Address"
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
          placeholder="Street address"
        />

        <Input
          label="Locality"
          name="address.locality"
          value={formData.address.locality}
          onChange={handleChange}
          placeholder="Area/Locality"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="City"
          name="address.city"
          value={formData.address.city}
          onChange={handleChange}
          placeholder="City"
        />

        <Input
          label="Pincode"
          name="address.pincode"
          value={formData.address.pincode}
          onChange={handleChange}
          placeholder="Pincode"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Payment Preference"
          name="paymentPreference"
          value={formData.paymentPreference}
          onChange={handleChange}
          options={paymentOptions}
        />

        {formData.paymentPreference === 'credit' && (
          <Input
            label="Credit Limit (₹)"
            name="creditLimit"
            type="number"
            value={formData.creditLimit}
            onChange={handleChange}
            min="0"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="whatsappOptIn"
          name="whatsappOptIn"
          checked={formData.whatsappOptIn}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
        />
        <label htmlFor="whatsappOptIn" className="text-sm text-gray-700">
          Send WhatsApp notifications
        </label>
      </div>

      <Input
        label="Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Any special notes about this customer"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  )
}

export default CustomerForm
