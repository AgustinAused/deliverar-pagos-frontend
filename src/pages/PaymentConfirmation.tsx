import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  Card,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Box
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';

const StyledCard = styled(Card)`
  padding: 2rem;
  max-width: 500px;
  margin: 2rem auto;
`;

const AmountDisplay = styled(Typography)`
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TokenAmount = styled(Typography)`
  color: #1976d2;
  font-weight: bold;
`;

const TransactionHash = styled(Typography)`
  word-break: break-all;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
`;

const PaymentConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');

  // Mock order details
  const orderAmount = 250;
  const tokenAmount = 10;

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Here you would typically:
      // 1. Check if user has enough tokens
      // 2. Call smart contract for payment
      // 3. Wait for transaction confirmation
      
      // Simulating blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful transaction
      setHash('0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join(''));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Confirm Payment
      </Typography>

      <Box sx={{ my: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Order Summary
        </Typography>
        
        <AmountDisplay variant="h4">
          <span>${orderAmount}</span>
          <TokenAmount>
            {tokenAmount} TKN
          </TokenAmount>
        </AmountDisplay>
      </Box>

      <Divider sx={{ my: 3 }} />

      {!success ? (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handlePayment}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <WalletIcon />}
        >
          {loading ? 'Processing...' : 'Pay with Tokens'}
        </Button>
      ) : (
        <Alert 
          severity="success"
          sx={{ mb: 2 }}
        >
          Payment successful!
        </Alert>
      )}

      {error && (
        <Alert 
          severity="error"
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {hash && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Transaction Hash:
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
            View on Etherscan
          </Button>
        </Box>
      )}
    </StyledCard>
  );
};

export default PaymentConfirmation; 