import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Divider,
  CircularProgress,
  Paper
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import web3Service from '../services/web3Service';

const StyledCard = styled(Card)`
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto;
`;

const ActionSection = styled(Paper)`
  padding: 1.5rem;
  margin: 1rem 0;
`;

const StatsContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const StatCard = styled(Paper)`
  padding: 1.5rem;
  text-align: center;
  background-color: #f8f9fa;
`;

const AdminTokenManagement = () => {
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalSupply, setTotalSupply] = useState(null);
  const [adminBalance, setAdminBalance] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const supply = await web3Service.getTotalSupply();
      setTotalSupply(supply);

      // Obtener la dirección del administrador y su balance
      const signer = await web3Service.getSigner();
      if (signer) {
        const address = await signer.getAddress();
        const balance = await web3Service.getBalance(address);
        setAdminBalance(balance);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const handleMint = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!web3Service.isValidAddress(mintAddress)) {
        throw new Error('Dirección de destino inválida');
      }

      if (!mintAmount || isNaN(Number(mintAmount)) || Number(mintAmount) <= 0) {
        throw new Error('Cantidad inválida para mint');
      }

      const tx = await web3Service.mint(mintAddress, mintAmount);
      setSuccess(`Tokens minteados exitosamente. Hash: ${tx.hash}`);
      setMintAddress('');
      setMintAmount('');
      await loadStats();
    } catch (err) {
      setError(err.message || 'Error al mintear tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!burnAmount || isNaN(Number(burnAmount)) || Number(burnAmount) <= 0) {
        throw new Error('Cantidad inválida para burn');
      }

      const tx = await web3Service.burn(burnAmount);
      setSuccess(`Tokens quemados exitosamente. Hash: ${tx.hash}`);
      setBurnAmount('');
      await loadStats();
    } catch (err) {
      setError(err.message || 'Error al quemar tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Administración de Tokens
      </Typography>

      <StatsContainer>
        <StatCard elevation={1}>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Supply Total
          </Typography>
          <Typography variant="h4" color="primary">
            {totalSupply ?? '...'} TKN
          </Typography>
        </StatCard>

        <StatCard elevation={1}>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Balance del Admin
          </Typography>
          <Typography variant="h4" color="primary">
            {adminBalance ?? '...'} TKN
          </Typography>
        </StatCard>
      </StatsContainer>

      <ActionSection elevation={2}>
        <Typography variant="h6" gutterBottom>
          Mintear Tokens
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Dirección Destino"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            placeholder="0x..."
            fullWidth
          />
          <TextField
            label="Cantidad"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            type="number"
            sx={{ width: '200px' }}
          />
          <Button
            variant="contained"
            onClick={handleMint}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Mint
          </Button>
        </Box>
      </ActionSection>

      <ActionSection elevation={2}>
        <Typography variant="h6" gutterBottom>
          Quemar Tokens
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Cantidad"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            type="number"
            fullWidth
          />
          <Button
            variant="contained"
            color="error"
            onClick={handleBurn}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RemoveIcon />}
          >
            Burn
          </Button>
        </Box>
      </ActionSection>

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

export default AdminTokenManagement; 