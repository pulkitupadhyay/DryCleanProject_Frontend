import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'
import { searchCustomers, clearSearchResults } from '../../features/customers/customersSlice'
import { formatPhone } from '../../utils/formatters'
import { useDebounce } from '../../hooks/useDebounce'

const CustomerSearch = ({ onSelect, onCreateNew }) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()
  const { searchResults } = useSelector((state) => state.customers)
  const wrapperRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      dispatch(searchCustomers(debouncedQuery))
      setIsOpen(true)
    } else {
      dispatch(clearSearchResults())
      setIsOpen(false)
    }
  }, [debouncedQuery, dispatch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (customer) => {
    onSelect(customer)
    setQuery('')
    setIsOpen(false)
    dispatch(clearSearchResults())
  }

  const handleCreateNew = () => {
    onCreateNew(query)
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by phone or name..."
          className="input pl-10"
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            <>
              {searchResults.map((customer) => (
                <button
                  key={customer._id}
                  onClick={() => handleSelect(customer)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{formatPhone(customer.phone)}</p>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No customers found
            </div>
          )}

          {/* Create new option */}
          <button
            onClick={handleCreateNew}
            className="w-full px-4 py-3 text-left hover:bg-primary-50 border-t border-gray-200 flex items-center gap-2 text-primary-600"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Create new customer</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default CustomerSearch
