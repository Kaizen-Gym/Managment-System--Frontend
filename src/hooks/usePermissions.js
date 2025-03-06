import { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const usePermissions = () => {
  const { user } = useContext(UserContext);
  console.debug("usePermissions hook: user", user);

  const hasPermission = (permission) => {
    if (!user) {
      console.warn("hasPermission: No user found");
      return false;
    }
    if (user.user_type && user.user_type.toLowerCase() === 'admin') {
      console.debug("hasPermission: User is admin, granting permission", permission);
      return true;
    }
    if (!user.permissions || !Array.isArray(user.permissions)) {
      console.warn("hasPermission: User has no permissions array");
      return false;
    }
    const result = user.permissions.includes(permission);
    console.debug("hasPermission: Result for", permission, "->", result);
    return result;
  };

  return { hasPermission };
};

export default usePermissions;
