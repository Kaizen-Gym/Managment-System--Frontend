import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/reports" element={<Reports />} />
        <Route path="/dashboard/membership-plans" element={<MembershipPlans />} />
        <Route path="/dashboard/members" element={<Member />} />
      </Routes>
    </Router>
  );
}

export default App;


