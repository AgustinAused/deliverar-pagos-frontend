import { ethers } from 'ethers';

// ABI completo del ERC20 con mint y burn
const TOKEN_ABI = [
  // Funciones básicas ERC20
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function totalSupply() public view returns (uint256)",
  // Funciones de administrador
  "function mint(address to, uint256 amount) public returns (bool)",
  "function burn(uint256 amount) public returns (bool)",
  // Eventos
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Mint(address indexed to, uint256 value)",
  "event Burn(address indexed from, uint256 value)"
];

// Dirección del contrato en Sepolia (reemplazar con tu dirección)
const TOKEN_CONTRACT_ADDRESS = "TU_DIRECCION_DEL_CONTRATO";

// URL de tu API backend
const API_URL = "TU_URL_API";

// Chain ID de Sepolia
const SEPOLIA_CHAIN_ID = '0xaa36a7';

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

  isMetaMaskInstalled(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.ethereum !== undefined &&
      window.ethereum.isMetaMask === true &&
      window.ethereum.isEip1193Provider === true
    );
  }

  async initialize() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask no está instalado o no está activo en este navegador');
    }

    try {
      // Verificar y cambiar a la red Sepolia si es necesario
      await this.checkAndSwitchNetwork();

      // Asegurarse de que window.ethereum es un provider válido
      if (!window.ethereum || !window.ethereum.request) {
        throw new Error('Provider de MetaMask no válido');
      }

      // Inicializar el provider
      this.provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      
      // Obtener el signer
      this.signer = await this.provider.getSigner();
      
      // Inicializar el contrato
      this.contract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_ABI,
        this.signer
      );

      return true;
    } catch (error) {
      console.error('Error inicializando Web3:', error);
      throw error;
    }
  }

  private async checkAndSwitchNetwork() {
    try {
      // Intentar cambiar a la red Sepolia
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Si la red no está agregada, la agregamos
      if (switchError.code === 4902) {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Test Network',
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'SEP',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      } else {
        throw switchError;
      }
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask no está instalado o no está activo en este navegador');
    }

    try {
      // Solicitar acceso a la cuenta - esto abrirá el popup de MetaMask
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts'  // Este método abre el popup de MetaMask
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No se pudo obtener la dirección de la wallet');
      }

      // Guardar la dirección en el backend
      await this.saveWalletAddress(accounts[0]);

      return accounts[0];
    } catch (error: any) {
      // Manejar el caso en que el usuario rechaza la conexión
      if (error.code === 4001) {
        throw new Error('Por favor conecta tu wallet de MetaMask para continuar');
      }
      console.error('Error conectando wallet:', error);
      throw error;
    }
  }

  async saveWalletAddress(address: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error('Error guardando la dirección en el backend');
      }
    } catch (error) {
      console.error('Error en la llamada al backend:', error);
      throw error;
    }
  }

  async transfer(toAddress: string, amount: string): Promise<ethers.TransactionResponse> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 no está inicializado');
    }

    try {
      // Validar la dirección de destino
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Dirección de destino inválida');
      }

      // Convertir el monto a la unidad correcta (18 decimales)
      const parsedAmount = ethers.parseUnits(amount, 18);

      // Ejecutar la transferencia - msg.sender será la dirección del usuario automáticamente
      const tx = await this.contract.transfer(toAddress, parsedAmount);

      // Retornar la transacción para que el frontend pueda esperar la confirmación
      return tx;
    } catch (error) {
      console.error('Error en la transferencia:', error);
      throw error;
    }
  }

  async mint(toAddress: string, amount: string): Promise<ethers.TransactionResponse> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 no está inicializado');
    }

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await this.contract.mint(toAddress, parsedAmount);
      await tx.wait();
      await this.saveTransaction(tx.hash, toAddress, amount, 'mint');
      return tx;
    } catch (error) {
      console.error('Error en el mint:', error);
      throw error;
    }
  }

  async burn(amount: string): Promise<ethers.TransactionResponse> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 no está inicializado');
    }

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await this.contract.burn(parsedAmount);
      await tx.wait();
      const address = await this.signer.getAddress();
      await this.saveTransaction(tx.hash, address, amount, 'burn');
      return tx;
    } catch (error) {
      console.error('Error en el burn:', error);
      throw error;
    }
  }

  async getTotalSupply(): Promise<string> {
    if (!this.contract) {
      throw new Error('Web3 no está inicializado');
    }

    try {
      const supply = await this.contract.totalSupply();
      return ethers.formatUnits(supply, 18);
    } catch (error) {
      console.error('Error obteniendo el total supply:', error);
      throw error;
    }
  }

  async saveTransaction(
    txHash: string, 
    toAddress: string, 
    amount: string, 
    type: 'transfer' | 'mint' | 'burn'
  ): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash,
          toAddress,
          amount,
          type,
          fromAddress: await this.signer?.getAddress(),
          network: 'sepolia'
        }),
      });

      if (!response.ok) {
        throw new Error('Error guardando la transacción en el backend');
      }
    } catch (error) {
      console.error('Error en la llamada al backend:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Web3 no está inicializado');
    }

    try {
      const balance = await this.contract.balanceOf(address);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error obteniendo el balance:', error);
      throw error;
    }
  }

  listenToTransfers(callback: (from: string, to: string, value: string, type: string) => void) {
    if (!this.contract) {
      throw new Error('Web3 no está inicializado');
    }

    // Escuchar eventos de Transfer
    this.contract.on("Transfer", (from, to, value, event) => {
      callback(from, to, ethers.formatUnits(value, 18), 'transfer');
    });

    // Escuchar eventos de Mint
    this.contract.on("Mint", (to, value, event) => {
      callback('0x0', to, ethers.formatUnits(value, 18), 'mint');
    });

    // Escuchar eventos de Burn
    this.contract.on("Burn", (from, value, event) => {
      callback(from, '0x0', ethers.formatUnits(value, 18), 'burn');
    });
  }

  async getSigner(): Promise<ethers.JsonRpcSigner | null> {
    if (!this.signer) {
      await this.initialize();
    }
    return this.signer;
  }

  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }
}

export const web3Service = new Web3Service();
export default web3Service; 