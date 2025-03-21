import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import PropTypes from 'prop-types';

const RequireAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RequireAuth;