// Validate Indian phone number
export const isValidIndianPhone = (phone) => {
  const phoneRegex = /^\+91[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

// Format phone input to include +91
// export const formatPhoneInput = (value) => {
//   // Remove all non-digits
//   let digits = value.replace(/\D/g, '')

//   // Remove leading 91 if present (user might type it)
//   if (digits.startsWith('91') && digits.length > 10) {
//     digits = digits.slice(2)
//   }

//   // Limit to 10 digits
//   digits = digits.slice(0, 10)

//   // Return with +91 prefix if we have digits
//   if (digits.length > 0) {
//     return '+91' + digits
//   }

//   return ''
// }
export const formatPhoneInput = (value) => {
  let digits = value.replace(/\D/g, '')

  // Always remove leading 91 if exists
  if (digits.startsWith('91')) {
    digits = digits.slice(2)
  }

  digits = digits.slice(0, 10)

  return digits ? `+91${digits}` : ''
}


// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate required field
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

// Validate minimum length
export const minLength = (value, min) => {
  return typeof value === 'string' && value.length >= min
}

// Validate positive number
export const isPositiveNumber = (value) => {
  const num = Number(value)
  return !isNaN(num) && num > 0
}
