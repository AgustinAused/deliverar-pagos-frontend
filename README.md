# Crypto Payment Platform

A modern React application for managing cryptocurrency payments and rewards in a delivery platform. This application provides interfaces for customers, delivery personnel, and administrators to manage token-based transactions.

## Features

- 💳 Wallet Registration and Management
- 💰 Token Balance Checking
- 🛒 Payment Processing with Tokens
- 🚚 Delivery Rewards System
- 📊 Transaction History
- 👨‍💼 Admin Dashboard with KPIs

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension (for wallet integration)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/deliverar-frontend.git
cd crypto-payment-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── pages/
│   ├── WalletRegistration.tsx   # Wallet connection and registration
│   ├── WalletBalance.tsx        # Token balance display
│   ├── PaymentConfirmation.tsx  # Payment processing
│   ├── DeliveryRewards.tsx      # Delivery personnel rewards
│   ├── TransactionHistory.tsx   # Transaction listing and filtering
│   └── AdminDashboard.tsx       # Admin controls and monitoring
├── App.tsx                      # Main application component
└── index.tsx                    # Application entry point
```

## Usage

### For Customers
- Register your Ethereum wallet
- Check token balance
- Make payments using tokens
- View transaction history

### For Delivery Personnel
- Track earned rewards
- View delivery history
- Monitor token earnings

### For Administrators
- Monitor all transactions
- View platform KPIs
- Export transaction data
- Search and filter operations

## Technology Stack

- React 18
- TypeScript
- Material-UI (MUI)
- Emotion (Styled Components)
- React Router
- ethers.js

## Development

To contribute to this project:

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request


