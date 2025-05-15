import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from '@emotion/styled';

// Pages
import WalletRegistration from './pages/WalletRegistration';
import WalletBalance from './pages/WalletBalance';
import PaymentConfirmation from './pages/PaymentConfirmation';
import DeliveryRewards from './pages/DeliveryRewards';
import TransactionHistory from './pages/TransactionHistory';
import AdminDashboard from './pages/AdminDashboard';
import Payments from './pages/Payments';

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
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Header>
          <Nav>
            <Link to="/wallet/register">Registrar Wallet</Link>
            <Link to="/wallet/balance">Balance</Link>
            <Link to="/payments">Pagos</Link>
            <Link to="/payment/confirm">Confirmar Pago</Link>
            <Link to="/delivery/rewards">Recompensas</Link>
            <Link to="/transactions">Historial</Link>
            <Link to="/admin">Admin</Link>
          </Nav>
        </Header>
        <MainContent>
          <Routes>
            <Route path="/wallet/register" element={<WalletRegistration />} />
            <Route path="/wallet/balance" element={<WalletBalance />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payment/confirm" element={<PaymentConfirmation />} />
            <Route path="/delivery/rewards" element={<DeliveryRewards />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/" element={<WalletBalance />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;
