/**
 * Centralized API error handling utility
 * Handles common HTTP errors and backend error responses
 */

/**
 * Handles API errors and returns user-friendly error messages
 * @param {Error} error - The error object from axios/API calls
 * @param {string} operation - Description of the operation being performed
 * @returns {Object} Object containing error message and title
 */
export const handleApiError = (error, operation = 'operation') => {
  let errorMessage = 'Something went wrong. Please try again.'
  let errorTitle = 'Error'

  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const data = error.response.data

    // Use backend error messages if available
    if (data && data.error) {
      errorMessage = data.error
    } else if (data && data.message) {
      errorMessage = data.message
    } else {
      // Fallback messages for common HTTP status codes
      switch (status) {
      case 400:
        errorMessage = 'Invalid request. Please check your input.'
        errorTitle = 'Bad Request'
        break
      case 401:
        errorMessage = 'You are not authorized to perform this action. Try logging in again.'
        errorTitle = 'Unauthorized'
        break
      case 403:
        errorMessage = 'You do not have permission to perform this action. Please contact your administrator.'
        errorTitle = 'Forbidden'
        break
      case 404:
        errorMessage = `The ${operation} was not found.`
        errorTitle = 'Not Found'
        break
      case 409:
        errorMessage = 'This action conflicts with existing data.'
        errorTitle = 'Conflict'
        break
      case 422:
        errorMessage = 'Validation failed. Please check your input.'
        errorTitle = 'Validation Error'
        break
      case 429:
        errorMessage = 'Too many requests. Please try again later.'
        errorTitle = 'Rate Limited'
        break
      case 500:
        errorMessage = 'Server error. Please try again later.'
        errorTitle = 'Server Error'
        break
      case 502:
        errorMessage = 'Bad gateway. Please try again later.'
        errorTitle = 'Gateway Error'
        break
      case 503:
        errorMessage = 'Service unavailable. Please try again later.'
        errorTitle = 'Service Unavailable'
        break
      default:
        if (status >= 500) {
          errorMessage = 'Server error. Please try again later.'
          errorTitle = 'Server Error'
        } else if (status >= 400) {
          errorMessage = 'Request error. Please try again.'
          errorTitle = 'Request Error'
        }
      }
    }
  } else if (error.request) {
    // Network error
    errorMessage = 'Network error. Please check your connection.'
    errorTitle = 'Connection Error'
  } else {
    // Other errors
    errorMessage = error.message || errorMessage
  }

  return { errorMessage, errorTitle }
}

/**
 * Creates a toast notification object
 * @param {string} message - The error message
 * @param {string} title - The error title
 * @param {string} variant - Bootstrap variant (danger, warning, info)
 * @returns {Object} Toast object with id, message, title, and variant
 */
export const createToast = (message, title = 'Error', variant = 'danger') => {
  return {
    id: Date.now(),
    message,
    title,
    variant
  }
}
