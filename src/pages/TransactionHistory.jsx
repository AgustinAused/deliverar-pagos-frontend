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

  // Mock transaction data - would come from API/blockchain
  const transactions = [
    {
      id: 1,
      timestamp: '2024-03-10T15:30:00',
      type: 'payment',
      amount: 10,
      status: 'success',
      hash: '0x1234...5678',
      description: 'Payment for order #123',
      from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
    {
      id: 2,
      timestamp: '2024-03-10T14:15:00',
      type: 'reward',
      amount: 2,
      status: 'success',
      hash: '0x5678...9012',
      description: 'Delivery reward',
      from: 'System',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
    {
      id: 3,
      timestamp: '2024-03-10T12:45:00',
      type: 'payment',
      amount: 5,
      status: 'pending',
      hash: '0x9012...3456',
      description: 'Payment for order #124',
      from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
    {
      id: 4,
      timestamp: '2024-03-09T16:20:00',
      type: 'deposit',
      amount: 20,
      status: 'success',
      hash: '0x3456...7890',
      description: 'Token purchase',
      from: 'Exchange',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    }
  ];

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
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

      let matchesDate = true;
      const txDate = new Date(tx.timestamp);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = txDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          matchesDate = txDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
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
                <TableCell>Descripción</TableCell>
                <TableCell>De</TableCell>
                <TableCell>Para</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Hash</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((tx) => (
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
                  <TableCell>
                    <Tooltip title={tx.from}>
                      <Link
                        href={`https://sepolia.etherscan.io/address/${tx.from}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {tx.from.length > 15 ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : tx.from}
                      </Link>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={tx.to}>
                      <Link
                        href={`https://sepolia.etherscan.io/address/${tx.to}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {tx.to.length > 15 ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : tx.to}
                      </Link>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <TransactionAmount color={getAmountColor(tx.type)}>
                      {getAmountPrefix(tx.type)}{tx.amount} TKN
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
                    <Tooltip title={tx.hash}>
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