import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ProtectedRoute from './services/ProtectedRoute';

// Routes
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Reports from './pages/Reports';
import MembershipPlans from './pages/MembershipPlans';
import Member from './pages/Member';

// App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5050/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        console.log(`user data ${response.data}`)
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>; // Show a loader while fetching user data

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute role={user?.user_type} allowedRoles={['Admin']} />}>
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/membership-plans" element={<MembershipPlans />} />
          <Route path="/dashboard/members" element={<Member />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
