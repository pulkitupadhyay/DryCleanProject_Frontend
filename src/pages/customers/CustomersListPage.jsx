import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { fetchCustomers, createCustomer } from '../../features/customers/customersSlice'
import { Card, Button, Modal, Table, Badge } from '../../components/common'
import CustomerForm from '../../components/forms/CustomerForm'
import { formatPhone, formatCurrency, formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

const CustomersListPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { customers, pagination, isLoading } = useSelector((state) => state.customers)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 20 }))
  }, [dispatch])

  const handleCreateCustomer = async (data) => {
    setIsCreating(true)
    try {
      await dispatch(createCustomer(data)).unwrap()
      toast.success('Customer created successfully')
      setShowModal(false)
    } catch (error) {
      toast.error(error || 'Failed to create customer')
    } finally {
      setIsCreating(false)
    }
  }

  const handlePageChange = (page) => {
    dispatch(fetchCustomers({ page, limit: 20 }))
  }

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">
            {pagination?.total || 0} total customers
          </p>
        </div>
        <Button icon={PlusIcon} onClick={() => setShowModal(true)}>
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="input pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header>Customer</Table.Header>
              <Table.Header>Phone</Table.Header>
              <Table.Header>Orders</Table.Header>
              <Table.Header>Total Spent</Table.Header>
              <Table.Header>Balance</Table.Header>
              <Table.Header>Last Order</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : filteredCustomers.length === 0 ? (
              <Table.Empty message="No customers found" colSpan={6} />
            ) : (
              filteredCustomers.map((customer) => (
                <Table.Row
                  key={customer._id}
                  clickable
                  onClick={() => navigate(`/customers/${customer._id}`)}
                >
                  <Table.Cell>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    {customer.email && (
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    )}
                  </Table.Cell>
                  <Table.Cell>{formatPhone(customer.phone)}</Table.Cell>
                  <Table.Cell>{customer.stats?.totalOrders || 0}</Table.Cell>
                  <Table.Cell>{formatCurrency(customer.stats?.totalSpent || 0)}</Table.Cell>
                  <Table.Cell>
                    {customer.currentBalance !== 0 ? (
                      <Badge
                        variant={customer.currentBalance > 0 ? 'success' : 'danger'}
                      >
                        {customer.currentBalance > 0 ? '+' : ''}
                        {formatCurrency(customer.currentBalance)}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {customer.stats?.lastOrderDate
                      ? formatDate(customer.stats.lastOrderDate)
                      : '-'}
                  </Table.Cell>
                </Table.Row>
              ))
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

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Customer"
        size="lg"
      >
        <CustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setShowModal(false)}
          isLoading={isCreating}
        />
      </Modal>
    </div>
  )
}

export default CustomersListPage
