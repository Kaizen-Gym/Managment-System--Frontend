import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const usePermissionCheck = (requiredPermission, redirectPath = '/unauthorized') => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      // No user logged in, redirect to login page
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      // Check if user is an Admin. If so, allow access to all pages
      if (user.user_type === 'Admin') {
        return; // No need to check specific permission, allow access.
      }

      const userPermissions = user.permissions || [];

      if (!userPermissions.includes(requiredPermission)) {
        // User lacks permission, redirect to Unauthorized page
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Error parsing user data from local storage:", error);
      navigate('/login');
    }

  }, [requiredPermission, navigate, redirectPath]);
};

export default usePermissionCheck;