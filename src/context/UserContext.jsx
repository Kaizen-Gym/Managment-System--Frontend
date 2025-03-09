import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.debug("UserProvider useEffect: storedUser", storedUser);
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.debug("UserProvider: parsedUser", parsedUser);
        // Ensure permissions is defined
        setUser({
          ...parsedUser,
          permissions: parsedUser.permissions || []
        });
      } catch (error) {
        console.error("Error parsing stored user JSON:", error);
        localStorage.removeItem('user');
      }
    } else {
      console.warn("UserProvider: No valid stored user found");
    }
    setLoadingUser(false);
  }, []);

  const login = (userData) => {
    console.debug("UserProvider: login called with", userData);
    setUser({
      ...userData,
      permissions: userData.permissions || []
    });
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.debug("UserProvider: logout called");
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loadingUser) return <div>Loading user...</div>;

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
