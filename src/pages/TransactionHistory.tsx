import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Box,
  Link
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CallReceived as ReceivedIcon,
  CallMade as SentIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)`
  padding: 2rem;
  max-width: 1000px;
  margin: 2rem auto;
`;

const FilterContainer = styled(Box)`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatusChip = styled(Chip)`
  min-width: 100px;
`;

const TransactionHistory = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock transaction data - would come from API/blockchain
  const transactions = [
    {
      id: 1,
      date: '2024-03-10T15:30:00',
      type: 'payment',
      amount: 10,
      status: 'success',
      hash: '0x1234...5678',
      description: 'Payment for order #123'
    },
    {
      id: 2,
      date: '2024-03-10T14:15:00',
      type: 'reward',
      amount: 2,
      status: 'success',
      hash: '0x5678...9012',
      description: 'Delivery reward'
    },
    {
      id: 3,
      date: '2024-03-10T12:45:00',
      type: 'payment',
      amount: 5,
      status: 'pending',
      hash: '0x9012...3456',
      description: 'Payment for order #124'
    }
  ];

  const getStatusColor = (status: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <SentIcon />;
      case 'reward':
        return <ReceivedIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Transaction History
      </Typography>

      <FilterContainer>
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="payment">Payments</MenuItem>
          <MenuItem value="reward">Rewards</MenuItem>
        </TextField>

        <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by description or hash..."
          sx={{ flexGrow: 1 }}
        />
      </FilterContainer>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Transaction Hash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {new Date(tx.date).toLocaleString()}
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
                  <StatusChip
                    label={tx.status}
                    color={getStatusColor(tx.status)}
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
    </StyledCard>
  );
};

export default TransactionHistory; 