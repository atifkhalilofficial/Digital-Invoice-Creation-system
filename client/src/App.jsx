import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InvoiceNew from './pages/InvoiceNew';
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceEdit from './pages/InvoiceEdit';
import Profile from './pages/Profile';
import ScheduleList from './pages/ScheduleList';
import ScheduleNew from './pages/ScheduleNew';
import ScheduleEdit from './pages/ScheduleEdit';

// Redirects to dashboard if logged in, login if not
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

// Redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root — redirect based on auth */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Public routes — redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/invoices/new" element={<PrivateRoute><InvoiceNew /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute><InvoiceList /></PrivateRoute>} />
        <Route path="/invoices/:id" element={<PrivateRoute><InvoiceDetail /></PrivateRoute>} />
        <Route path="/invoices/:id/edit" element={<PrivateRoute><InvoiceEdit /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/schedules" element={<PrivateRoute><ScheduleList /></PrivateRoute>} />
        <Route path="/schedules/new" element={<PrivateRoute><ScheduleNew /></PrivateRoute>} />
        <Route path="/schedules/:id/edit" element={<PrivateRoute><ScheduleEdit /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;