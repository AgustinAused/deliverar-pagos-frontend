import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  Card,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { AccountBalance as AccountBalanceIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import web3Service from '../services/web3Service';

const StyledCard = styled(Card)`
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto;
`;

const ActionCard = styled(Paper)`
  padding: 2rem;
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
  margin-bottom: 1rem;
`;

const Payments = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Aquí iría la lógica para procesar el depósito
      // Por ejemplo, conectar con una pasarela de pago
      setSuccess(`Depósito de $${depositAmount} procesado exitosamente`);
      setDepositAmount('');
    } catch (err: any) {
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
      // Aquí iría la lógica para comprar tokens
      // Por ejemplo, llamar al smart contract
      setSuccess(`Compra de ${tokenAmount} tokens procesada exitosamente`);
      setTokenAmount('');
    } catch (err: any) {
      setError(err.message || 'Error comprando tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Gestión de Pagos
      </Typography>

      <ActionCard elevation={2}>
        <IconBox>
          <AccountBalanceIcon color="primary" fontSize="large" />
          <Typography variant="h6">
            Ingresar Dinero
          </Typography>
        </IconBox>
        <Typography color="textSecondary">
          Ingresa el monto en USD que deseas depositar en tu cuenta
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            label="Monto a depositar"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            type="number"
            fullWidth
            placeholder="0.00"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
          <Button
            variant="contained"
            onClick={handleDeposit}
            disabled={loading}
            sx={{ minWidth: '150px', height: '56px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Depositar'}
          </Button>
        </Box>
      </ActionCard>

      <Divider sx={{ my: 3 }} />

      <ActionCard elevation={2}>
        <IconBox>
          <ShoppingCartIcon color="primary" fontSize="large" />
          <Typography variant="h6">
            Comprar Tokens
          </Typography>
        </IconBox>
        <Typography color="textSecondary">
          Compra tokens para utilizar en la plataforma
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            label="Cantidad de tokens"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            type="number"
            fullWidth
            placeholder="0"
            InputProps={{
              endAdornment: <Typography sx={{ ml: 1 }}>TKN</Typography>
            }}
          />
          <Button
            variant="contained"
            onClick={handleBuyTokens}
            disabled={loading}
            sx={{ minWidth: '150px', height: '56px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Comprar'}
          </Button>
        </Box>
      </ActionCard>

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
    </StyledCard>
  );
};

export default Payments; 