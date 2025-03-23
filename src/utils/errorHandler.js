export const formatErrorMessage = (error) => {
  // Check if it's an axios error with a response from the server
  if (error.response?.data?.message) {
    // Filter out sensitive information from server messages
    const message = error.response.data.message;
    // Return user-friendly messages for common errors
    if (message.includes('password') || message.includes('credential')) {
      return 'Invalid credentials. Please check your login details.';
    } else if (message.includes('permission') || message.includes('authorization')) {
      return 'You do not have permission to perform this action.';
    } else if (message.includes('database') || message.includes('server')) {
      return 'A system error occurred. Please try again later.';
    }
    // For other messages, return a sanitized version
    return sanitizeErrorMessage(message);
  }
  
  // Network errors
  if (error.message?.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // Default fallback message
  return 'An unexpected error occurred. Please try again later.';
};

// Remove potential sensitive info from error messages
const sanitizeErrorMessage = (message) => {
  // Replace potential SQL snippets, file paths, stack traces
  const sanitized = message
    .replace(/SELECT|INSERT|UPDATE|DELETE|FROM|WHERE/gi, '[SQL]')
    .replace(/\/[\w\/\.-]+/g, '[path]')
    .replace(/at .+ \(.+:\d+:\d+\)/g, '[trace]');
    
  // Only return first 100 characters to avoid detailed errors
  return sanitized.length > 100 
    ? sanitized.substring(0, 100) + '...' 
    : sanitized;
};

// Log errors for developers while showing sanitized versions to users
export const handleError = (error, context = '') => {
  // Log the full error for debugging (in development only)
  if (import.meta.env.VITE_API_URL === 'development') {
    console.error(`Error in ${context}:`, error);
    console.debug('Full error object:', JSON.stringify(error, null, 2));
  } else {
    // In production, log minimal information
    console.error(`Error in ${context}: ${error.message || 'Unknown error'}`);
  }
  
  // Return user-friendly message
  return formatErrorMessage(error);
};