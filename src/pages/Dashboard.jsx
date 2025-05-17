import React, { useState, useEffect } from 'react';
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
  Link
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

  // Transaction History State
  const transactions = [
    {
      id: 1,
      timestamp: '2024-03-10T15:30:00',
      type: 'payment',
      amount: 10,
      status: 'success',
      hash: '0x1234...5678',
      description: 'Payment for order #123'
    },
    {
      id: 2,
      timestamp: '2024-03-10T14:15:00',
      type: 'reward',
      amount: 2,
      status: 'success',
      hash: '0x5678...9012',
      description: 'Delivery reward'
    },
    {
      id: 3,
      timestamp: '2024-03-10T12:45:00',
      type: 'payment',
      amount: 5,
      status: 'pending',
      hash: '0x9012...3456',
      description: 'Payment for order #124'
    }
  ];

  const fetchBalance = async () => {
    setBalanceLoading(true);
    setMoneyBalanceLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBalance(Math.floor(Math.random() * 100));
      setMoneyBalance(Math.floor(Math.random() * 1000));
      setLastSync(new Date());
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
      setMoneyBalanceLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      setSuccess(`Depósito de $${depositAmount} procesado exitosamente`);
      setDepositAmount('');
      await fetchBalance(); // Refresh balance after deposit
    } catch (err) {
      setError(err.message || 'Error procesando el depósito');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTokens = async () => {
    if (!tokenAmount || isNaN(Number(tokenAmount)) || Number(tokenAmount) <= 0) {
      setError('Por favor ingresa una cantidad válida de tokens');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      setSuccess(`Compra de ${tokenAmount} tokens procesada exitosamente`);
      setTokenAmount('');
      await fetchBalance(); // Refresh balance after purchase
    } catch (err) {
      setError(err.message || 'Error comprando tokens');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      setError('Por favor ingresa una cantidad válida de tokens');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newHash = '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      setHash(newHash);
      setSuccess('¡Pago realizado exitosamente!');
      setPaymentAmount('');
      await fetchBalance(); // Refresh balance after payment
    } catch (err) {
      setError(err.message || 'Error procesando el pago');
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

  useEffect(() => {
    fetchBalance();
  }, []);

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
                        ${moneyBalance.toFixed(2)}
                      </MoneyAmount>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchBalance}
                        size="small"
                        sx={{ mb: 0.5 }}
                      >
                        Refresh
                      </Button>
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
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchBalance}
                        size="small"
                        sx={{ mb: 0.5 }}
                      >
                        Refresh
                      </Button>
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
                <Box sx={{ display: 'flex', gap: 2 }}>
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
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePayment}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <WalletIcon />}
                  >
                    {loading ? 'Procesando...' : 'Pagar'}
                  </Button>
                </Box>

                {hash && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Hash de la Transacción:
                    </Typography>
                    <TransactionHash variant="body2">
                      {hash}
                    </TransactionHash>
                    <Button 
                      variant="text"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${hash}`)}
                    >
                      Ver en Etherscan
                    </Button>
                  </Box>
                )}
              </ActionCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Transaction History Section */}
        <Grid item xs={12}>
          <Card sx={{ mt: 3 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Historial de Transacciones
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Hash</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {new Date(tx.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeIcon(tx.type)}
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </Box>
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell align="right">
                        <Typography
                          color={tx.type === 'payment' ? 'error' : 'success'}
                          fontWeight="bold"
                        >
                          {tx.type === 'payment' ? '-' : '+'}{tx.amount} TKN
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status}
                          color={tx.status === 'success' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {tx.hash}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </DashboardContainer>
  );
};

export default Dashboard; 