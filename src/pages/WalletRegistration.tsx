import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { 
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { ethers } from 'ethers';
import web3Service from '../services/web3Service';

const StyledCard = styled(Card)`
  padding: 2rem;
  max-width: 500px;
  margin: 2rem auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TransactionDialog = styled(Dialog)`
  .MuiDialog-paper {
    padding: 1rem;
  }
`;

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (toAddress: string, amount: string) => Promise<void>;
}

const TransferDialog: React.FC<TransferDialogProps> = ({ open, onClose, onConfirm }) => {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!ethers.isAddress(toAddress)) {
      setError('Dirección de destino inválida');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Monto inválido');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      await onConfirm(toAddress, amount);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en la transferencia');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TransactionDialog open={open} onClose={onClose}>
      <DialogTitle>Realizar Transferencia</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Dirección de Destino"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            fullWidth
          />
          <TextField
            label="Cantidad de Tokens"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            fullWidth
          />
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : null}
        >
          {isProcessing ? 'Procesando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </TransactionDialog>
  );
};

const WalletRegistration = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  // Manejadores de eventos de MetaMask
  const handleChainChanged = useCallback(() => {
    setIsMetaMaskInstalled(web3Service.isMetaMaskInstalled());
    // Recargar la página cuando cambie la red
    window.location.reload();
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    setIsMetaMaskInstalled(web3Service.isMetaMaskInstalled());
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
    } else {
      setWalletAddress('');
      setBalance(null);
    }
  }, []);

  useEffect(() => {
    setIsMetaMaskInstalled(web3Service.isMetaMaskInstalled());
    
    // Escuchar cambios en la red o la cuenta
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Verificar si ya hay una cuenta conectada
      window.ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(console.error);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleChainChanged, handleAccountsChanged]);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  const fetchBalance = async () => {
    try {
      const balance = await web3Service.getBalance(walletAddress);
      setBalance(balance);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!ethers.isAddress(walletAddress)) {
        throw new Error('Formato de dirección Ethereum inválido');
      }

      await web3Service.saveWalletAddress(walletAddress);
      setSuccess('¡Wallet vinculada exitosamente!');
      
    } catch (err: any) {
      setError(err.message || 'Error al vincular wallet');
    }
  };

  const handleWalletConnect = async () => {
    try {
      const address = await web3Service.connectWallet();
      setWalletAddress(address);
      setSuccess('¡Wallet conectada exitosamente!');
    } catch (err: any) {
      setError(err.message || 'Error al conectar wallet');
    }
  };

  const handleTransfer = async (toAddress: string, amount: string) => {
    try {
      // La transacción se ejecuta directamente desde la wallet del usuario
      const tx = await web3Service.transfer(toAddress, amount);
      
      // Esperar a que la transacción se confirme
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('No se pudo confirmar la transacción');
      }
      
      setSuccess(`¡Transferencia exitosa! Hash: ${receipt.hash}`);
      
      // Actualizar el balance después de la confirmación
      await fetchBalance();
      
      // Cerrar el diálogo de transferencia
      setIsTransferDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error en la transferencia');
    }
  };

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Gestión de Wallet
      </Typography>
      
      <Form onSubmit={handleSubmit}>
        <TextField
          label="Dirección Ethereum"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          fullWidth
          variant="outlined"
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
          >
            Vincular Wallet
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleWalletConnect}
            fullWidth
          >
            Conectar MetaMask
          </Button>
        </Box>

        {balance !== null && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Balance
            </Typography>
            <Typography variant="h4" color="primary">
              {balance} TKN
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsTransferDialogOpen(true)}
              sx={{ mt: 2 }}
              fullWidth
            >
              Realizar Transferencia
            </Button>
          </Box>
        )}

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success">
            {success}
          </Alert>
        )}

        {walletAddress && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Wallet Conectada: {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </Typography>
        )}
      </Form>

      <TransferDialog
        open={isTransferDialogOpen}
        onClose={() => setIsTransferDialogOpen(false)}
        onConfirm={handleTransfer}
      />
    </StyledCard>
  );
};

export default WalletRegistration; 