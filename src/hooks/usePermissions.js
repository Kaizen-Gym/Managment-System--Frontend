import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const usePermissions = () => {
  const { user } = useContext(UserContext);

  const hasPermission = (permission) => {
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  return { hasPermission };
};

export default usePermissions;
