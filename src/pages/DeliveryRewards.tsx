import React from 'react';
import styled from '@emotion/styled';
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Paper
} from '@mui/material';
import { LocalShipping as DeliveryIcon } from '@mui/icons-material';

const StyledCard = styled(Card)`
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto;
`;

const RewardBadge = styled(Chip)`
  font-weight: bold;
  font-size: 1rem;
  padding: 1rem;
  background-color: #e3f2fd;
  color: #1976d2;
`;

const StatsContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
`;

const StatCard = styled(Paper)`
  padding: 1.5rem;
  text-align: center;
`;

const DeliveryRewards = () => {
  // Mock data - would come from API/blockchain
  const deliveries = [
    {
      id: 1,
      date: '2024-03-10T15:30:00',
      address: '123 Main St',
      reward: 2,
      orderValue: 45.99
    },
    {
      id: 2,
      date: '2024-03-10T14:15:00',
      address: '456 Oak Ave',
      reward: 3,
      orderValue: 75.50
    },
    {
      id: 3,
      date: '2024-03-10T12:45:00',
      address: '789 Pine Rd',
      reward: 2,
      orderValue: 35.25
    }
  ];

  const totalRewards = deliveries.reduce((sum, delivery) => sum + delivery.reward, 0);
  const totalDeliveries = deliveries.length;
  const averageReward = totalRewards / totalDeliveries;

  return (
    <StyledCard>
      <Typography variant="h5" component="h1" gutterBottom>
        Delivery Rewards
      </Typography>

      <StatsContainer>
        <StatCard elevation={2}>
          <Typography variant="h6" color="primary" gutterBottom>
            Total Rewards
          </Typography>
          <Typography variant="h4">
            {totalRewards} TKN
          </Typography>
        </StatCard>

        <StatCard elevation={2}>
          <Typography variant="h6" color="primary" gutterBottom>
            Deliveries
          </Typography>
          <Typography variant="h4">
            {totalDeliveries}
          </Typography>
        </StatCard>

        <StatCard elevation={2}>
          <Typography variant="h6" color="primary" gutterBottom>
            Avg. Reward
          </Typography>
          <Typography variant="h4">
            {averageReward.toFixed(1)} TKN
          </Typography>
        </StatCard>
      </StatsContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Recent Deliveries
      </Typography>

      <List>
        {deliveries.map((delivery) => (
          <ListItem
            key={delivery.id}
            divider
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <ListItemText
                primary={delivery.address}
                secondary={new Date(delivery.date).toLocaleString()}
              />
              <Typography variant="body2" color="text.secondary">
                Order Value: ${delivery.orderValue}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeliveryIcon color="action" />
              <RewardBadge
                label={`+${delivery.reward} TKN`}
              />
            </Box>
          </ListItem>
        ))}
      </List>
    </StyledCard>
  );
};

export default DeliveryRewards; 