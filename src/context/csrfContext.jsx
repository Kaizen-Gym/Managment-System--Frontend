// frontend/src/context/CsrfContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { getCsrfToken, resetCsrfToken } from '../utils/csrf';
import PropTypes from 'prop-types';

const CsrfContext = createContext();

export const CsrfProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchToken = async () => {
    try {
      const newToken = await getCsrfToken();
      setToken(newToken);
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = () => {
    resetCsrfToken();
    fetchToken();
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return (
    <CsrfContext.Provider value={{ token, refreshToken, loading }}>
      {children}
    </CsrfContext.Provider>
  );
};

CsrfProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCsrf = () => useContext(CsrfContext);