import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from '@emotion/styled';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';

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
  padding: 0 1rem;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Header>
          <Nav>
            <Link to="/">Dashboard</Link>
            <Link to="/transactions">Transacciones</Link>
            <Link to="/admin">Admin</Link>
          </Nav>
        </Header>
        <MainContent>
          <Routes>
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App; 