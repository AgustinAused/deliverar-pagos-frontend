import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import {
  TrendingUp,
  Group,
  AccountBalance,
  Download as DownloadIcon,
  Search as SearchIcon
} from '@mui/icons-material';

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

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - would come from API/blockchain
  const kpiData = {
    totalVolume: 15000,
    activeUsers: 250,
    totalTransactions: 1200
  };

  const transactions = [
    {
      id: 1,
      timestamp: '2024-03-10T15:30:00',
      from: '0x1234...5678',
      to: '0x8765...4321',
      amount: 100,
      type: 'transfer',
      status: 'success'
    },
    {
      id: 2,
      timestamp: '2024-03-10T14:15:00',
      from: '0x2345...6789',
      to: '0x9876...5432',
      amount: 50,
      type: 'reward',
      status: 'success'
    },
    {
      id: 3,
      timestamp: '2024-03-10T12:45:00',
      from: '0x3456...7890',
      to: '0x0987...6543',
      amount: 75,
      type: 'payment',
      status: 'pending'
    }
  ];

  const handleExport = () => {
    // Implementation for exporting data
    console.log('Exporting data...');
  };

  const handleSearch = () => {
    // Implementation for searching transactions
    console.log('Searching:', searchQuery);
  };

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
                {kpiData.totalVolume} TKN
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
                {kpiData.activeUsers}
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
                {kpiData.totalTransactions}
              </Typography>
            </Box>
          </KPICard>
        </Grid>
      </Grid>

      <SearchContainer>
        <TextField
          fullWidth
          label="Search by address or transaction hash"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="0x..."
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export
        </Button>
      </SearchContainer>

      <TableContainer component={Paper}>
        <Table>
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
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {new Date(tx.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{tx.from}</TableCell>
                <TableCell>{tx.to}</TableCell>
                <TableCell>{tx.amount} TKN</TableCell>
                <TableCell>
                  <Chip
                    label={tx.type}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={tx.status}
                    color={tx.status === 'success' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledCard>
  );
};

export default AdminDashboard; 