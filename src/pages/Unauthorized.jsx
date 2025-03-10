import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = ({ message = "You do not have permission to view this page." }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      // No user logged in, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleGoBack = () => {
    navigate('/dashboard'); // Redirect to dashboard
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-md p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
          <p className="text-gray-700 mb-6">{message}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
