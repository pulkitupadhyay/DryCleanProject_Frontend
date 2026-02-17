import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import { fetchServices, createService, updateService, toggleService } from '../../features/services/servicesSlice'
import { Card, Button, Modal, Badge, Input, Select } from '../../components/common'
import { formatCurrency } from '../../utils/formatters'
import { SERVICE_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const ServiceForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    pricing: { single: '', pair: '' },
    estimatedHours: 24
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        category: initialData.category || '',
        description: initialData.description || '',
        pricing: initialData.pricing || { single: '', pair: '' },
        estimatedHours: initialData.estimatedHours || 24
      })
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      pricing: {
        single: Number(formData.pricing.single),
        pair: Number(formData.pricing.pair)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Service Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          placeholder="e.g., DCI"
          required
          disabled={!!initialData}
          maxLength={10}
        />
      </div>

      <Select
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        options={SERVICE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
        required
      />

      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Single Item Price (₹)"
          type="number"
          value={formData.pricing.single}
          onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, single: e.target.value } })}
          min="0"
          required
        />
        <Input
          label="Pair Price (₹)"
          type="number"
          value={formData.pricing.pair}
          onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, pair: e.target.value } })}
          min="0"
          required
        />
      </div>

      <Input
        label="Estimated Hours"
        type="number"
        value={formData.estimatedHours}
        onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
        min="1"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>{initialData ? 'Update' : 'Create'} Service</Button>
      </div>
    </form>
  )
}

const ServicesListPage = () => {
  const dispatch = useDispatch()
  const { services, isLoading } = useSelector((state) => state.services)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchServices())
  }, [dispatch])

  const handleSubmit = async (data) => {
    setIsSaving(true)
    try {
      if (editingService) {
        await dispatch(updateService({ id: editingService._id, data })).unwrap()
        toast.success('Service updated')
      } else {
        await dispatch(createService(data)).unwrap()
        toast.success('Service created')
      }
      setShowModal(false)
      setEditingService(null)
    } catch (error) {
      toast.error(error || 'Operation failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (service) => {
    try {
      await dispatch(toggleService(service._id)).unwrap()
      toast.success(`Service ${service.isActive ? 'disabled' : 'enabled'}`)
    } catch (error) {
      toast.error('Failed to update service')
    }
  }

  const getCategoryLabel = (category) => {
    return SERVICE_CATEGORIES.find(c => c.value === category)?.label || category
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">Manage service categories and pricing</p>
        </div>
        <Button icon={PlusIcon} onClick={() => { setEditingService(null); setShowModal(true) }}>
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          services.map((service) => (
            <Card key={service._id} className={!service.isActive ? 'opacity-60' : ''}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <Badge variant="primary" size="sm">{service.code}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{getCategoryLabel(service.category)}</p>
                </div>
                <button
                  onClick={() => { setEditingService(service); setShowModal(true) }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>

              {service.description && (
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Single</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(service.pricing.single)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Pair</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(service.pricing.pair)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{service.estimatedHours}h estimated</span>
                <button
                  onClick={() => handleToggle(service)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    service.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingService(null) }}
        title={editingService ? 'Edit Service' : 'Add Service'}
        size="md"
      >
        <ServiceForm
          initialData={editingService}
          onSubmit={handleSubmit}
          onCancel={() => { setShowModal(false); setEditingService(null) }}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  )
}

export default ServicesListPage
