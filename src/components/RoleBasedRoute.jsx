import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const userRole = localStorage.getItem('userRole');

  return (
    <Route
      {...rest}
      render={(props) =>
        allowedRoles.includes(userRole) ? (
          <Component {...props} />
        ) : (
          <Navigate to="/login" />
        )
      }
    />
  );
};

export default RoleBasedRoute;
