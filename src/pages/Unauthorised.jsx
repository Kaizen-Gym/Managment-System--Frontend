import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

function UnauthorisedPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '2rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
        <FaLock size={48} color="#ff4d4f" style={{ marginRight: '0.5rem' }} />
        <h1 style={{ fontSize: '2rem', color: '#333', margin: 0 }}>
          Unauthorised
        </h1>
      </div>
      <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
        You do not have permission to access this page.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleLoginClick}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button
          onClick={handleDashboardClick}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#52c41a',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}

export default UnauthorisedPage;
