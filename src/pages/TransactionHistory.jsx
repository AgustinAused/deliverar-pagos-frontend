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
  Paper
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CallReceived as ReceivedIcon,
  CallMade as SentIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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

  // Fetch transactions from the API
  const fetchTransactions = async () => {
    setLoading(true);
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
      const matchesSearch = 
        (tx.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.hash?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.from?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.to?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.originOwner?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.destinationOwner?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.concept?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (tx.type?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || (tx.concept || tx.type || '').toLowerCase() === typeFilter;
      const matchesStatus = statusFilter === 'all' || (tx.status || '').toLowerCase() === statusFilter;

      let matchesDate = true;
      const txDate = new Date(tx.transactionDate || tx.createdAt || tx.timestamp);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = txDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          matchesDate = txDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          matchesDate = txDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  };

  const filteredTransactions = filterTransactions();

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        Historial de Transacciones
      </Typography>

      <FilterSection elevation={2}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por descripción, hash o dirección..."
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="payment">Pagos</MenuItem>
                <MenuItem value="reward">Recompensas</MenuItem>
                <MenuItem value="deposit">Depósitos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Fecha</InputLabel>
              <Select
                value={dateFilter}
                label="Fecha"
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">Todo</MenuItem>
                <MenuItem value="today">Hoy</MenuItem>
                <MenuItem value="week">Última semana</MenuItem>
                <MenuItem value="month">Último mes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Filtros activos">
              <IconButton color={typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' ? 'primary' : 'default'}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </FilterSection>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>De</TableCell>
                <TableCell>Para</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Hash</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((tx) => (
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
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(tx.concept || tx.type)}
                      {(tx.concept || tx.type || '').charAt(0).toUpperCase() + (tx.concept || tx.type || '').slice(1)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {tx.originOwner?.email || tx.from || ''}
                  </TableCell>
                  <TableCell>
                    {tx.destinationOwner?.email || tx.to || ''}
                  </TableCell>
                  <TableCell align="right">
                    <TransactionAmount color={getAmountColor(tx.concept || tx.type)}>
                      {getAmountPrefix(tx.concept || tx.type)}{tx.amount} {tx.currency || 'TKN'}
                    </TransactionAmount>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.status}
                      color={getStatusColor(tx.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={tx.blockchainInTxHash || tx.hash || ''}>
                      <Link
                        href={tx.blockchainInTxHash ? `https://sepolia.etherscan.io/tx/${tx.blockchainInTxHash}` : tx.hash ? `https://sepolia.etherscan.io/tx/${tx.hash}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {tx.blockchainInTxHash || tx.hash || ''}
                      </Link>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </PageContainer>
  );
};

export default TransactionHistory; 