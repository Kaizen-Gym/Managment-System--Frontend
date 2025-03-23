const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Configure the minimum level based on environment
const MIN_LOG_LEVEL = import.meta.env.PROD ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

// User info to include with logs
let userInfo = {};

// Initialize logger with user info (call this after login)
export const initLogger = (user) => {
  if (user) {
    userInfo = {
      id: user._id,
      email: user.email,
      role: user.user_type || user.role,
    };
  }
};

// Clear user info (call this after logout)
export const clearLoggerUser = () => {
  userInfo = {};
};

// Format log data to include timestamp, user info, etc.
const formatLogData = (message, data) => {
  const timestamp = new Date().toISOString();
  const context = {
    timestamp,
    userInfo,
    environment: import.meta.env.MODE,
    url: window.location.href,
    ...data,
  };

  return {
    message,
    context,
  };
};

// Always send logs to backend regardless of environment
const sendToBackend = async (logData, level) => {
  try {
    const levelName = ['debug', 'info', 'warn', 'error'][level];
    const endpoint = `${import.meta.env.VITE_API_URL}/api/logs`;

    // Using fetch to avoid circular dependencies with our axios instances
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level: levelName,
        message: logData.message,
        context: logData.context,
      }),
      credentials: 'include',
    }).catch((e) => {
      // Silent failure for logging service
      // We use console.error here only for logging service failures
      console.error('Failed to send log to backend:', e);
    });
  } catch (error) {
    // Don't throw errors from the logger
    console.error('Error in logger:', error);
  }
};

// Core logging function
const logMessage = (level, message, data = {}) => {
  // Skip if below minimum level
  if (level < MIN_LOG_LEVEL) return;

  const logData = formatLogData(message, data);

  // No longer logging to console, only sending to backend
  sendToBackend(logData, level);
};

// Public API
export const logger = {
  debug: (message, data) => logMessage(LOG_LEVELS.DEBUG, message, data),
  info: (message, data) => logMessage(LOG_LEVELS.INFO, message, data),
  warn: (message, data) => logMessage(LOG_LEVELS.WARN, message, data),
  error: (message, data) => logMessage(LOG_LEVELS.ERROR, message, data),
};

// Log uncaught errors
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', {
    message: event.message,
    filename: event.filename,
    lineNo: event.lineno,
    colNo: event.colno,
    error: event.error ? event.error.stack : 'No error details available',
  });
});

// Log unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason
      ? event.reason.stack || event.reason.message || event.reason
      : 'No rejection details available',
  });
});

export default logger;
