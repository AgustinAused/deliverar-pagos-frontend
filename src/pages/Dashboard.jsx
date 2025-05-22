import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  TablePagination
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountBalanceWallet as WalletIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  CallReceived as ReceivedIcon,
  CallMade as SentIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import web3Service from '../services/web3Service';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';


const DashboardContainer = styled(Box)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const BalanceCard = styled(Card)`
  padding: 1rem;
  text-align: center;
  margin: 0 auto;
`;

const TokenAmount = styled(Typography)`
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #1976d2;
`;

const MoneyAmount = styled(Typography)`
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #2e7d32;
`;

const TokenSymbol = styled.span`
  font-size: 1.2rem;
  margin-left: 0.5rem;
`;

const ActionCard = styled(Paper)`
  padding: 1.5rem;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #f8f9fa;
`;

const IconBox = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const TransactionHash = styled(Typography)`
  word-break: break-all;
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
`;

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

const Dashboard = () => {
  // Balance States
  const [balance, setBalance] = useState(0);
  const [moneyBalance, setMoneyBalance] = useState(0);
  const [lastSync, setLastSync] = useState(new Date());
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [moneyBalanceLoading, setMoneyBalanceLoading] = useState(false);

  // Payment States
  const [depositAmount, setDepositAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hash, setHash] = useState('');
  const [destinationEmail, setDestinationEmail] = useState('');

  // Transaction History State
  const { user, setUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const OWNER_ID = 'e564456a-2590-4ec8-bcb7-77bcd9dba05b';

  const pollingRef = useRef(null);

  // Add separate alert state for each box
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState('');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');

  const fetchBalance = async () => {
    setBalanceLoading(true);
    setMoneyBalanceLoading(true);
    try {
      if (user?.role?.toLowerCase() === 'core') {
        const response = await api.get(`/api/owners/${OWNER_ID}/balances`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Cache-Control': 'no-cache'
          }
        });
        setBalance(response.data.cryptoBalance);
        setMoneyBalance(response.data.fiatBalance);
        setLastSync(new Date());
      } else {
        setBalance(Math.floor(Math.random() * 100));
        setMoneyBalance(Math.floor(Math.random() * 1000));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
      setMoneyBalanceLoading(false);
    }
  };

  
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setDepositError('Por favor ingresa un monto válido');
      setDepositSuccess('');
      return;
    }
    setLoading(true);
    setDepositError('');
    setDepositSuccess('');
    try {
      await api.post(
        `/api/owners/${OWNER_ID}/fiat`,
        { amount: parseFloat(depositAmount), operation: "INFLOW" },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setDepositSuccess('Depósito procesado exitosamente');
      setDepositAmount('');
      await fetchBalance();
      await fetchAllTransactions();
    } catch (err) {
      setDepositError(err.response?.data?.message || 'Revisar datos ingresados');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTokens = async () => {
    if (!tokenAmount || isNaN(Number(tokenAmount)) || Number(tokenAmount) <= 0) {
      setBuyError('Por favor ingresa una cantidad válida de tokens');
      setBuySuccess('');
      return;
    }
    setLoading(true);
    setBuyError('');
    setBuySuccess('');
    try {
      // 1. Fetch owner email
      const ownerRes = await api.get(
        `/api/owners/${OWNER_ID}`,
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const ownerEmail = ownerRes.data.email;
      // 2. Call buy endpoint
      await api.post(
        '/api/delivercoin/buy',
        { email: ownerEmail, amount: parseFloat(tokenAmount) },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );

      setBuySuccess(`Compra de ${tokenAmount} tokens procesada exitosamente`);
      setTokenAmount('');
      await fetchBalance(); // Refresh balance after purchase
      await fetchAllTransactions();
    } catch (err) {
      setBuyError(err.response?.data?.message || 'Revisar datos ingresados');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      setPayError('Por favor ingresa una cantidad válida de tokens');
      setPaySuccess('');
      return;
    }
    setLoading(true);
    setPayError('');
    setPaySuccess('');
    try {
      // 1. Fetch owner email
      const ownerRes = await api.get(
        `/api/owners/${OWNER_ID}`,
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const ownerEmail = ownerRes.data.email;
      const transferAmount = parseFloat(paymentAmount);
      // 2. Call transfer endpoint
      const transferResponse = await api.post(
        '/api/delivercoin/transfer',
        { fromEmail: ownerEmail, toEmail: destinationEmail, amount: transferAmount },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const txHash = transferResponse.data.hash;
      setHash(txHash);
      setPaySuccess('Pago realizado exitosamente!');
      setPaymentAmount('');
      setDestinationEmail('');
      await fetchBalance();
      await fetchAllTransactions();
    } catch (err) {
      console.error('Payment error:', err);
      if (err.response?.status === 400) {
        setPayError(
          err.response?.data?.message ||
          'Revisar datos ingresados'
        );
      } else if (err.response?.status === 500) {
        setPayError(
          err.response?.data?.message ||
          'Error interno del servidor. Intenta nuevamente más tarde.'
        );
      } else {
        setPayError(
          err.response?.data?.message ||
          err.message ||
          'Error procesando el pago'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment':
        return <SentIcon />;
      case 'reward':
        return <ReceivedIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const pollPendingTransactions = (transactions) => {
    const hasPending = transactions.some(tx => tx.status === 'PENDING');
    if (hasPending && !pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        const updated = await fetchAllTransactions();
        if (updated && !updated.some(tx => tx.status === 'PENDING')) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }, 5000);
    } else if (!hasPending && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchAllTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const [allRes, fiatRes] = await Promise.all([
        api.get(`/api/owners/${OWNER_ID}/transactions`, {
          headers: { Authorization: `Bearer ${user.accessToken}` }
        }),
        api.get(`/api/owners/${OWNER_ID}/transactions/fiat`, {
          headers: { Authorization: `Bearer ${user.accessToken}` }
        })
      ]);
      const allTx = Array.isArray(allRes.data.transactions) ? allRes.data.transactions : [];
      const fiatTx = Array.isArray(fiatRes.data.transactions) ? fiatRes.data.transactions : [];
      const combined = [...allTx, ...fiatTx].sort(
        (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
      );
      setTransactions(combined);
      pollPendingTransactions(combined);
      return combined;
    } catch (err) {
      setTransactions([]);
      setError('Error fetching transactions');
      return [];
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Call this when the component mounts or when the user changes
  useEffect(() => {
    if (user?.accessToken) {
      fetchAllTransactions();
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, []);

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Add email validation helper
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Add this helper above your return:
  const isNegativeAmount = paymentAmount && !isNaN(Number(paymentAmount)) && Number(paymentAmount) < 0;

  return (
    <DashboardContainer>
      <Grid container spacing={3}>
        {/* Balance Cards Row */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* Money Balance Section */}
            <Grid item xs={12} md={6}>
              <BalanceCard elevation={2}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Balance en Dinero
                </Typography>
                <Box sx={{ position: 'relative', minHeight: '90px' }}>
                  {moneyBalanceLoading ? (
                    <CircularProgress 
                      size={30}
                      sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-15px',
                        marginLeft: '-15px'
                      }}
                    />
                  ) : (
                    <>
                      <MoneyAmount>
                        ${(moneyBalance ?? 0).toFixed(2)}
                      </MoneyAmount>
                      <Typography variant="body2" color="text.secondary">
                        Last sync: {lastSync.toLocaleTimeString()}
                      </Typography>
                    </>
                  )}
                </Box>
              </BalanceCard>
            </Grid>

            {/* Token Balance Section */}
            <Grid item xs={12} md={6}>
              <BalanceCard elevation={2}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Token Balance
                </Typography>
                <Box sx={{ position: 'relative', minHeight: '90px' }}>
                  {balanceLoading ? (
                    <CircularProgress 
                      size={30}
                      sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-15px',
                        marginLeft: '-15px'
                      }}
                    />
                  ) : (
                    <>
                      <TokenAmount>
                        {balance}
                        <TokenSymbol>TKN</TokenSymbol>
                      </TokenAmount>
                      <Typography variant="body2" color="text.secondary">
                        Last sync: {lastSync.toLocaleTimeString()}
                      </Typography>
                    </>
                  )}
                </Box>
              </BalanceCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Payment Actions Section */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* Ingresar Dinero */}
            <Grid item xs={12} md={4}>
              <ActionCard elevation={2}>
                <IconBox>
                  <AccountBalanceIcon color="primary" />
                  <Typography variant="h6">
                    Ingresar Dinero
                  </Typography>
                </IconBox>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Monto a depositar"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleDeposit}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Depositar'}
                  </Button>
                </Box>
                {depositSuccess && <Alert severity="success" sx={{ mb: 2 }}>{depositSuccess}</Alert>}
                {depositError && <Alert severity="error" sx={{ mb: 2 }}>{depositError}</Alert>}
              </ActionCard>
            </Grid>

            {/* Comprar Tokens */}
            <Grid item xs={12} md={4}>
              <ActionCard elevation={2}>
                <IconBox>
                  <ShoppingCartIcon color="primary" />
                  <Typography variant="h6">
                    Comprar Tokens
                  </Typography>
                </IconBox>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Cantidad de tokens"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                    placeholder="0"
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>TKN</Typography>
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleBuyTokens}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Comprar'}
                  </Button>
                </Box>
                {buySuccess && <Alert severity="success" sx={{ mb: 2 }}>{buySuccess}</Alert>}
                {buyError && <Alert severity="error" sx={{ mb: 2 }}>{buyError}</Alert>}
              </ActionCard>
            </Grid>

            {/* Pagar con Tokens */}
            <Grid item xs={12} md={4}>
              <ActionCard elevation={2}>
                <IconBox>
                  <WalletIcon color="primary" />
                  <Typography variant="h6">
                    Pagar con Tokens
                  </Typography>
                </IconBox>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Cantidad de tokens"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                    placeholder="0"
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>TKN</Typography>
                    }}
                    error={isNegativeAmount}
                    helperText={isNegativeAmount ? 'Ingresar número válido' : ''}
                  />
                  <TextField
                    label="Email destino"
                    value={destinationEmail}
                    onChange={(e) => setDestinationEmail(e.target.value)}
                    type="email"
                    fullWidth
                    size="small"
                    placeholder="ejemplo@correo.com"
                    sx={{ mb: 2 }}
                    error={!!destinationEmail && !isValidEmail(destinationEmail)}
                    helperText={
                      !!destinationEmail && !isValidEmail(destinationEmail)
                        ? 'Ingrese un email válido'
                        : ''
                    }
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePayment}
                    disabled={
                      loading ||
                      !paymentAmount ||
                      isNaN(Number(paymentAmount)) ||
                      Number(paymentAmount) <= 0 ||
                      !destinationEmail ||
                      !isValidEmail(destinationEmail)
                    }
                    startIcon={loading ? <CircularProgress size={20} /> : <WalletIcon />}
                  >
                    {loading ? 'Procesando...' : 'Pagar'}
                  </Button>
                  {paySuccess && <Alert severity="success" sx={{ mt: 2 }}>{paySuccess}</Alert>}
                  {payError && <Alert severity="error" sx={{ mt: 2 }}>{payError}</Alert>}
                </Box>
                {hash && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Hash de la Transacción:
                    </Typography>
                    <TransactionHash variant="body2">
                      {hash}
                    </TransactionHash>
                    <Typography
                      sx={{ mt: 1, color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${hash}`)}
                    >
                      Ver en Etherscan: https://sepolia.etherscan.io/tx/{hash}
                    </Typography>
                  </Box>
                )}
              </ActionCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Transaction History Section */}
        <Grid item xs={12}>
          <Card sx={{ mt: 3 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" gutterBottom>
                Historial de Transacciones
              </Typography>
            </Box>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Destinatario</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>ID Transaccion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {tx.transactionDate ? new Date(tx.transactionDate).toLocaleString() : ''}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tx.concept || tx.type}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {tx.destinationOwner?.email || tx.to || ''}
                        </TableCell>
                        <TableCell align="right">
                          {tx.amount} {tx.currency}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tx.status}
                            color={
                              tx.status === 'SUCCESS' || tx.status === 'success'
                                ? 'success'
                                : tx.status === 'PENDING'
                                ? 'warning'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {tx.id}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={transactions.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[6, 12, 18, 50]}
            />
          </Card>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard; 