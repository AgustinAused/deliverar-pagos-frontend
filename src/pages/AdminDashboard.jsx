import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {
  Card,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  Group,
  AccountBalance,
  Download as DownloadIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import web3Service from '../services/web3Service';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import delivercoinImg from '../images/dc.png';
import api from '../services/api';

const StyledCard = styled(Card)`
  padding: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
`;

const KPICard = styled(Paper)`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled(Box)`
  background-color: #e3f2fd;
  color: #1976d2;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const SearchContainer = styled(Box)`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
`;

const TokenActionCard = styled(Paper)`
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ActionContainer = styled(Box)`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
`;

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance with base URL
const apiInstance = axios.create({
  baseURL: API_URL,
});

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateSearchQuery, setDateSearchQuery] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [kpiData, setKpiData] = useState({
    totalOfCryptos: 0,
    totalOfOwners: 0,
    totalOfTransactions: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [walletsPage, setWalletsPage] = useState(0);
  const [walletsRowsPerPage, setWalletsRowsPerPage] = useState(100);
  const [wallets, setWallets] = useState([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [walletsError, setWalletsError] = useState('');
  const [totalWallets, setTotalWallets] = useState(0);

  // Move fetchKpis outside useEffect so it can be called from handleMint
  const fetchKpis = async () => {
    try {
      const response = await apiInstance.get('/api/delivercoin', {
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });
      setKpiData(response.data);
    } catch (err) {
      setKpiData({
        totalOfCryptos: 0,
        totalOfOwners: 0,
        totalOfTransactions: 0
      });
    }
  };

  // Fetch transactions from the API
  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await axios.get(
        'https://api.blockchain.deliver.ar/api/transactions',
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        }
      );
      setTransactions(Array.isArray(response.data.transactions) ? response.data.transactions : []);
    } catch (err) {
      setTransactions([]);
      setError('Error fetching transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Fetch wallets from /api/owners con paginación correcta
  const fetchWallets = async (page = 0, size = 10) => {
    setWalletsLoading(true);
    setWalletsError('');
    try {
      const response = await api.get('/api/owners', {
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        },
        params: {
          page: page,      // 0-based
          size: size       // cantidad por página
          // Puedes agregar fieldBy y direction si quieres ordenar
        }
      });
      const walletsData = response.data.ownersList || response.data.owners || response.data || [];
      const total = response.data.total || response.data.totalCount || response.data.count || walletsData.length;
      setWallets(Array.isArray(walletsData) ? walletsData : []);
      setTotalWallets(total);
      setWalletsError('');
    } catch (err) {
      setWallets([]);
      setWalletsError('Error fetching wallets');
      setTotalWallets(0);
    } finally {
      setWalletsLoading(false);
    }
  };

  // Fetch transactions on mount and when user changes
  useEffect(() => {
    if (user?.accessToken) {
      fetchTransactions();
    }
  }, [user]);

  useEffect(() => {
    if (user?.accessToken) {
      fetchKpis();
    }
  }, [user]);

  useEffect(() => {
    if (user?.accessToken) {
      fetchWallets(walletsPage, walletsRowsPerPage);
    }
  }, [user, walletsPage, walletsRowsPerPage]);

  const handleExport = () => {
    // Export filtered transactions as JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTransactions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "transactions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleSearch = () => {
    // Implementation for searching transactions
    console.log('Searching:', searchQuery);
  };

  const handleWalletsPageChange = (event, newPage) => {
    setWalletsPage(newPage);
  };

  const handleWalletsRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setWalletsRowsPerPage(newRowsPerPage);
    setWalletsPage(0); // Reset to first page when changing rows per page
  };

  const testFetchAllWallets = async () => {
    console.log('Testing fetch all wallets without pagination...');
    try {
      const response = await api.get('/api/owners', {
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });
      console.log('Test response (all wallets):', response);
      console.log('Total wallets found:', response.data?.ownersList?.length || response.data?.owners?.length || response.data?.length || 0);
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  const handleMint = async () => {
    if (!tokenAmount || isNaN(Number(tokenAmount)) || Number(tokenAmount) <= 0) {
      setError('Ingrese una cantidad valida ');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiInstance.post(
        '/api/delivercoin/mint',

        { amount: parseFloat(tokenAmount) },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        }
      );
      setSuccess(`Successfully minted ${tokenAmount} tokens`);
      setTokenAmount('');
      await fetchKpis(); // Refresh KPIs after mint
    } catch (err) {
      setError(err.response?.data?.message || 'Error minting tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!tokenAmount || isNaN(Number(tokenAmount)) || Number(tokenAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiInstance.post(
        '/api/delivercoin/burn',
        { amount: parseFloat(tokenAmount) },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        }
      );
      setSuccess(`Successfully burned ${tokenAmount} tokens`);
      setTokenAmount('');
      await fetchKpis(); // Refresh KPIs after burn
    } catch (err) {
      setError(err.response?.data?.message || 'Error burning tokens');
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filterTransactions = () => {
    return transactions.filter(tx => {
      // Format the date to a readable string for searching
      const txDate = tx.transactionDate || tx.createdAt || tx.timestamp;
      let formattedDate = '';
      if (txDate) {
        try {
          formattedDate = new Date(txDate).toLocaleString();
        } catch (e) {
          formattedDate = String(txDate);
        }
      }
      const matchesSearch =
        (tx.originOwner?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.destinationOwner?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.concept?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.type?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.amount !== undefined && tx.amount !== null && tx.amount.toString().includes(searchQuery));
      const matchesDate = !dateSearchQuery || formattedDate.toLowerCase().includes(dateSearchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (tx.status || '').toLowerCase() === statusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });
  };

  const filteredTransactions = filterTransactions();

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <KPICard elevation={2} sx={{ minWidth: 260, width: '90%', mr: { md: 2, xs: 0 } }}>
            <IconWrapper>
              <img src={delivercoinImg} alt="DeliverCoin" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%' }} />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Volumen Total
              </Typography>
              <Typography variant="h4">
                {kpiData.totalOfCryptos} DC
              </Typography>
            </Box>
          </KPICard>
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard elevation={2} sx={{ minWidth: 260, width: '90%', mr: { md: 2, xs: 0 } }}>
            <IconWrapper>
              <Group />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Owners Activos
              </Typography>
              <Typography variant="h4">
                {kpiData.totalOfOwners}
              </Typography>
            </Box>
          </KPICard>
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard elevation={2} sx={{ minWidth: 260, width: '90%' }}>
            <IconWrapper>
              <AccountBalance />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Transacciones Totales
              </Typography>
              <Typography variant="h4">
                {kpiData.totalOfTransactions}
              </Typography>
            </Box>
          </KPICard>
        </Grid>
      </Grid>

      <TokenActionCard elevation={2}>
        <Typography variant="h6" gutterBottom>
          Manejo de DeliveryCoins
        </Typography>
        <ActionContainer>
          <TextField
            label="Cantidad de DeliveryCoins"
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="Ingrese la cantidad"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleMint}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ height: '56px', minWidth: '120px', fontWeight: 500, fontSize: '1rem', boxSizing: 'border-box' }}
          >
            Mint
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBurn}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RemoveIcon />}
            sx={{ height: '56px', minWidth: '120px', fontWeight: 500, fontSize: '1rem', boxSizing: 'border-box' }}
          >
            Burn
          </Button>
        </ActionContainer>
        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        ) : null}
      </TokenActionCard>

      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por email, cantidad, movimiento, estado..."
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buscar por fecha"
              value={dateSearchQuery}
              onChange={(e) => setDateSearchQuery(e.target.value)}
              placeholder=""
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          <Grid item xs={12} md="auto">
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="success">Exitoso</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="failed">Fallido</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md="auto" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ height: '56px', minWidth: '120px', fontWeight: 500, fontSize: '1rem', boxSizing: 'border-box' }}
            >
              Exportar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Movimiento</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {tx.transactionDate ? new Date(tx.transactionDate).toLocaleString() : tx.timestamp ? new Date(tx.timestamp).toLocaleString() : ''}
                </TableCell>
                <TableCell>{tx.originOwner?.email || tx.from}</TableCell>
                <TableCell>{tx.destinationOwner?.email || tx.to}</TableCell>
                <TableCell>{tx.amount} {tx.currency || 'TKN'}</TableCell>
                <TableCell>
                  <Chip
                    label={tx.concept || tx.type}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={tx.status}
                    color={tx.status === 'SUCCESS' || tx.status === 'success' ? 'success' : 'warning'}
                    size="small"
                  />
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

      {/* Wallets Table */}
      <Typography variant="h6" component="h2" sx={{ mt: 6, mb: 2 }}>
        Wallets
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 400, maxWidth: 1200, margin: '0 auto', mb: 4 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Owner Email</TableCell>
              <TableCell>Tipo Usuario</TableCell>
              <TableCell>Saldo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {walletsLoading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : walletsError ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {walletsError}
                </TableCell>
              </TableRow>
            ) : wallets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No wallets found
                </TableCell>
              </TableRow>
            ) : (
              wallets.map((wallet) => (
                <TableRow key={wallet.id || wallet.email}>
                  <TableCell>{wallet.email}</TableCell>
                  <TableCell>
                    <Chip label={wallet.ownerType} color={wallet.ownerType === 'cliente' ? 'primary' : wallet.ownerType === 'tenant' ? 'secondary' : 'success'} variant="outlined" />
                  </TableCell>
                  <TableCell>{wallet.cryptoBalance}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalWallets}
        page={walletsPage}
        onPageChange={handleWalletsPageChange}
        rowsPerPage={walletsRowsPerPage}
        onRowsPerPageChange={handleWalletsRowsPerPageChange}
        rowsPerPageOptions={[6, 12, 18, 50, 100]}
      />
    </StyledCard>
  );
};

export default AdminDashboard; 