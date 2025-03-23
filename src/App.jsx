import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import { CsrfProvider } from './context/csrfContext.jsx';
import CsrfErrorBoundary from './components/CsrfErrorBoundary.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx'; // Import new component

// Routes
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Reports from './pages/Reports';
import MembershipPlans from './pages/MembershipPlans';
import Member from './pages/Member';
import UserManagement from './pages/UserManagement';
import PaymentRecord from './pages/PaymentRecord';
import Unauthorized from './pages/Unauthorized';
import Settings from './pages/Settings.jsx';

function App() {
  const handleGlobalError = (error, errorInfo) => {
    // In a real app, you might send this to a logging service like Sentry
    console.error('Global error caught:', error);
    // You could also implement API calls to your backend for logging
  };
  
  // Handler for CSRF errors
  const handleCsrfError = () => {
    // Refresh CSRF token or redirect to login
    window.location.href = '/login';
  };
  
  return (
    <ErrorBoundary onError={handleGlobalError}>
      <CsrfProvider>
        <CsrfErrorBoundary onCsrfError={handleCsrfError}>
          <UserProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard/reports" element={<Reports />} />
                <Route path="/dashboard/membership-plans" element={<MembershipPlans />}/>
                <Route path="/dashboard/members" element={<Member />} />
                <Route path="/dashboard/user-management" element={<UserManagement /> }/>
                <Route path="/dashboard/payment-record" element={<PaymentRecord />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/dashboard/settings" element={<Settings />} />
              </Routes>
            </Router>
          </UserProvider>
        </CsrfErrorBoundary>
      </CsrfProvider>
    </ErrorBoundary>
  );
}

export default App;