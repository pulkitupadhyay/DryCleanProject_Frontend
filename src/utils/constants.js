// Order statuses
export const ORDER_STATUS = {
  COLLECTED: 'collected',
  PROCESSING: 'processing',
  WASHED: 'washed',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

// Status labels and colors
export const ORDER_STATUS_CONFIG = {
  collected: { label: 'Collected', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
  washed: { label: 'Washed', color: 'bg-purple-100 text-purple-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
}

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid'
}

export const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-red-100 text-red-800' },
  partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' }
}

// Payment modes
export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'credit', label: 'Credit' },
  { value: 'advance', label: 'From Advance' }
]

// Service categories
export const SERVICE_CATEGORIES = [
  { value: 'dry_clean_iron', label: 'Dry Clean + Iron', code: 'DCI' },
  { value: 'iron_only', label: 'Iron Only', code: 'IRN' },
  { value: 'steam_press', label: 'Steam Press', code: 'STP' },
  { value: 'chemical_wash', label: 'Chemical Wash', code: 'CHW' }
]

// Cloth types
export const CLOTH_TYPES = {
  'Upper Wear': ['Shirt', 'T-Shirt', 'Kurta', 'Blouse', 'Top', 'Sweater', 'Jacket', 'Coat', 'Blazer'],
  'Lower Wear': ['Pant', 'Jeans', 'Shorts', 'Skirt', 'Salwar', 'Leggings'],
  'Full Body': ['Suit (2pc)', 'Suit (3pc)', 'Saree', 'Lehenga', 'Dress', 'Gown', 'Sherwani'],
  'Home/Bedding': ['Bedsheet (Single)', 'Bedsheet (Double)', 'Blanket', 'Quilt', 'Curtain', 'Pillow Cover'],
  'Others': ['Towel', 'Scarf', 'Dupatta', 'Tie', 'Handkerchief']
}

// Flatten cloth types
export const ALL_CLOTH_TYPES = Object.values(CLOTH_TYPES).flat()

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
}
