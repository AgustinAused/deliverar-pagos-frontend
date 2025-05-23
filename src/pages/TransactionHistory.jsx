import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Tooltip,
  Paper,
  TablePagination,
  Button
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CallReceived as ReceivedIcon,
  CallMade as SentIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Add API_URL and api instance
const API_URL = process.env.REACT_APP_API_URL;
const api = axios.create({
  baseURL: API_URL,
});

const PageContainer = styled(Box)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const FilterSection = styled(Paper)`
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const TransactionAmount = styled(Typography)`
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TransactionHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [dateSearchQuery, setDateSearchQuery] = useState('');

  // Fetch transactions from the API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Use fixed ownerId
      const ownerId = 'e564456a-2590-4ec8-bcb7-77bcd9dba05b';
      const [allTxRes, fiatTxRes] = await Promise.all([
        api.get('/api/transactions', {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        }),
        api.get(`/api/owners/${ownerId}/transactions/fiat`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        })
      ]);
      const allTx = Array.isArray(allTxRes.data.transactions) ? allTxRes.data.transactions : [];
      const fiatTx = Array.isArray(fiatTxRes.data.transactions) ? fiatTxRes.data.transactions : [];
      // Sort by date descending (latest to earliest)
      const combined = [...allTx, ...fiatTx].sort((a, b) => {
        const dateA = new Date(a.transactionDate || a.createdAt || a.timestamp);
        const dateB = new Date(b.transactionDate || b.createdAt || b.timestamp);
        return dateB - dateA;
      });
      setTransactions(combined);
    } catch (err) {
      setTransactions([]);
      setError('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.accessToken) {
      fetchTransactions();
    }
  }, [user]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment':
        return <SentIcon color="error" />;
      case 'reward':
        return <ReceivedIcon color="success" />;
      case 'deposit':
        return <ReceivedIcon color="primary" />;
      default:
        return <PaymentIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAmountColor = (type) => {
    switch (type) {
      case 'payment':
        return 'error';
      case 'reward':
      case 'deposit':
        return 'success';
      default:
        return 'inherit';
    }
  };

  const getAmountPrefix = (type) => {
    switch (type) {
      case 'payment':
        return '-';
      case 'reward':
      case 'deposit':
        return '+';
      default:
        return '';
    }
  };

  const filterTransactions = () => {
    return transactions.filter(tx => {
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
        (tx.amount !== undefined && tx.amount !== null && tx.amount.toString().includes(searchQuery)) ||
        (tx.id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesDate = !dateSearchQuery || formattedDate.toLowerCase().includes(dateSearchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (tx.status || '').toLowerCase() === statusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });
  };

  const filteredTransactions = filterTransactions();

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTransactions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "transactions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        Historial de Transacciones
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por email, cantidad, movimiento, estado, id transaccion..."
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

      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
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
                <TableCell>ID Transaccion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {tx.transactionDate
                      ? new Date(tx.transactionDate).toLocaleString()
                      : tx.createdAt
                      ? new Date(tx.createdAt).toLocaleString()
                      : tx.timestamp
                      ? new Date(tx.timestamp).toLocaleString()
                      : ''}
                  </TableCell>
                  <TableCell>{tx.originOwner?.email || tx.from || ''}</TableCell>
                  <TableCell>{tx.destinationOwner?.email || tx.to || ''}</TableCell>
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
                      color={
                        tx.status === 'SUCCESS' || tx.status === 'success'
                          ? 'success'
                          : tx.status === 'PENDING' || tx.status === 'pending'
                          ? 'warning'
                          : tx.status === 'FAILED' || tx.status === 'failed'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{tx.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredTransactions.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[6, 12, 18, 50]}
        />
      </Paper>
    </PageContainer>
  );
};

export default TransactionHistory; 