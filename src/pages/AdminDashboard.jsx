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
  TablePagination
} from '@mui/material';
import {
  TrendingUp,
  Group,
  AccountBalance,
  Download as DownloadIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import web3Service from '../services/web3Service';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
  padding: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
const api = axios.create({
  baseURL: API_URL,
});

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
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

  // Move fetchKpis outside useEffect so it can be called from handleMint
  const fetchKpis = async () => {
    try {
      const response = await api.get('/api/delivercoin', {
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

  const handleMint = async () => {
    if (!tokenAmount || isNaN(Number(tokenAmount)) || Number(tokenAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(
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
      await api.post(
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

  // Filter transactions client-side based on searchQuery
  const filteredTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    return (
      (tx.originOwner?.email?.toLowerCase() || '').includes(query) ||
      (tx.destinationOwner?.email?.toLowerCase() || '').includes(query) ||
      (tx.from?.toLowerCase() || '').includes(query) ||
      (tx.to?.toLowerCase() || '').includes(query) ||
      (tx.concept?.toLowerCase() || '').includes(query) ||
      (tx.type?.toLowerCase() || '').includes(query) ||
      (tx.status?.toLowerCase() || '').includes(query) ||
      (tx.id?.toLowerCase() || '').includes(query)
    );
  });

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <KPICard elevation={2}>
            <IconWrapper>
              <TrendingUp />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Total Volume
              </Typography>
              <Typography variant="h4">
                {kpiData.totalOfCryptos} TKN
              </Typography>
            </Box>
          </KPICard>
        </Grid>

        <Grid item xs={12} md={4}>
          <KPICard elevation={2}>
            <IconWrapper>
              <Group />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Active Users
              </Typography>
              <Typography variant="h4">
                {kpiData.totalOfOwners}
              </Typography>
            </Box>
          </KPICard>
        </Grid>

        <Grid item xs={12} md={4}>
          <KPICard elevation={2}>
            <IconWrapper>
              <AccountBalance />
            </IconWrapper>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Total Transactions
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
          Token Management
        </Typography>
        <ActionContainer>
          <TextField
            label="Token Amount"
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="Enter amount"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleMint}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Mint
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBurn}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RemoveIcon />}
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

      <SearchContainer>
        <TextField
          fullWidth
          label="Search by address or transaction hash"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="0x..."
        />
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export
        </Button>
      </SearchContainer>

      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
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
    </StyledCard>
  );
};

export default AdminDashboard; 