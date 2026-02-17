import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  SignalIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { useSocket } from '../../contexts/SocketContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingBagIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Services', href: '/services', icon: TagIcon, roles: ['admin', 'manager'] },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['admin', 'manager'] },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['admin'] }
]

const Sidebar = ({ isOpen, onClose }) => {
  const { hasRole } = useAuth()
  const { isConnected } = useSocket()

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || hasRole(...item.roles)
  )

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="font-semibold text-gray-900">Dry Cleaner</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isConnected ? (
              <>
                <SignalIcon className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600">Live updates on</span>
              </>
            ) : (
              <>
                <SignalSlashIcon className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Reconnecting...</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center">
            v1.0.0 &copy; 2024
          </p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
