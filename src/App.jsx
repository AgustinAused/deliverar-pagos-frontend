import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import Unauthorized from './pages/Unauthorized';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Header = styled.header`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    &:hover {
      color: #007bff;
    }
  }
`;

const MainContent = styled.main`
  padding: 2rem;
`;

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show navigation on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Header>
      <Nav>
        {user?.role === 'admin' && <Link to="/admin-dashboard">Admin Dashboard</Link>}
        {user?.role === 'auditor' && <Link to="/transaction-history">Transaction History</Link>}
        {user?.role === 'user' && <Link to="/dashboard">Dashboard</Link>}
        <Link to="#" onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout</Link>
      </Nav>
    </Header>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Navigation />
          <MainContent>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transaction-history"
                element={
                  <ProtectedRoute requiredRole="auditor">
                    <TransactionHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole={['user', 'core']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to login if not authenticated */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </MainContent>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App; 