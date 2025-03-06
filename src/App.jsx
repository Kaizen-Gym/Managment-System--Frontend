import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleBasedRoute from './components/RoleBasedRoute';

// Routes
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Reports from './pages/Reports';
import MembershipPlans from './pages/MembershipPlans';
import Member from './pages/Member';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RoleBasedRoute allowedRoles={['admin', 'manager']} component={Dashboard} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/reports" element={<RoleBasedRoute allowedRoles={['admin', 'manager']} component={Reports} />} />
        <Route path="/dashboard/membership-plans" element={<RoleBasedRoute allowedRoles={['admin', 'manager']} component={MembershipPlans} />} />
        <Route path="/dashboard/members" element={<RoleBasedRoute allowedRoles={['admin', 'manager']} component={Member} />} />
      </Routes>
    </Router>
  );
}

export default App;
