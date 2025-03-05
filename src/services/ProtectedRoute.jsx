import PropTypes from "prop-types";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role, allowedRoles }) => {
  if (!role) return <Navigate to="/login"/>; // Redirect to login if role is missing
  
  return role && allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/unauthorized" />;
};

ProtectedRoute.propTypes = {
  role: PropTypes.string,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;