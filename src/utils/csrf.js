import Cookies from 'js-cookie';

let csrfToken = null;

export const setCsrfToken = (token) => {
  csrfToken = token;
};

export const getCsrfToken = async () => {
  // First check for token in cookie
  const cookieToken = Cookies.get('_csrf');
  
  if (cookieToken) {
    csrfToken = cookieToken;
    return cookieToken;
  }

  // If no token in cookie, fetch new one from server
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/csrf-token`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
};

export const resetCsrfToken = () => {
  csrfToken = null;
};