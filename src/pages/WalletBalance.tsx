import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {
  Card,
  Typography,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const StyledCard = styled(Card)`
  padding: 2rem;
  max-width: 500px;
  margin: 2rem auto;
  text-align: center;
`;

const TokenAmount = styled(Typography)`
  font-size: 3rem;
  font-weight: bold;
  margin: 1.5rem 0;
  color: #1976d2;
`;

const TokenSymbol = styled.span`
  font-size: 1.5rem;
  margin-left: 0.5rem;
`;

const LastSync = styled(Typography)`
  color: #666;
  margin-top: 1rem;
`;

const TOKEN_CONTRACT_ADDRESS = "TU_DIRECCION_DEL_CONTRATO";
const API_URL = "TU_URL_API";

const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const WalletBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to your backend or blockchain
      // For demo purposes, we'll simulate a delay and random balance
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBalance(Math.floor(Math.random() * 100));
      setLastSync(new Date());
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Token Balance
      </Typography>

      <Box sx={{ position: 'relative', minHeight: '150px' }}>
        {loading ? (
          <CircularProgress 
            size={60}
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-30px',
              marginLeft: '-30px'
            }}
          />
        ) : (
          <>
            <TokenAmount variant="h1">
              {balance}
              <TokenSymbol>TKN</TokenSymbol>
            </TokenAmount>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchBalance}
              sx={{ mt: 2 }}
            >
              Refresh Balance
            </Button>

            <LastSync variant="body2">
              Last synchronized: {lastSync.toLocaleTimeString()}
            </LastSync>
          </>
        )}
      </Box>
    </StyledCard>
  );
};

export default WalletBalance; 