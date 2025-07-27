"use client";

import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  likedActivities: string[];
  dislikedActivities: string[];
}

interface PastTripsSidebarProps {
  trips: Trip[];
  onTripSelect: (trip: Trip) => void;
  selectedTripId?: string;
}

export default function PastTripsSidebar({ trips, onTripSelect, selectedTripId }: PastTripsSidebarProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate) return '';
    if (!endDate) return formatDate(startDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <Box
      sx={{
        width: '280px',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        overflowY: 'auto',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          Past Trips
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
          {trips.length} trip{trips.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {trips.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                  No trips yet
                </Typography>
              }
            />
          </ListItem>
        ) : (
          trips.map((trip, index) => (
            <Box key={trip.id}>
              <ListItem
                component="div"
                onClick={() => onTripSelect(trip)}
                sx={{
                  backgroundColor: selectedTripId === trip.id ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedTripId === trip.id 
                      ? 'rgba(102, 126, 234, 0.3)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                    {trip.destination}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', mt: 1 }}>
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </Typography>
                  {trip.likedActivities.length > 0 && (
                    <Typography sx={{ color: 'rgba(34, 197, 94, 0.8)', fontSize: '12px', mt: 0.5 }}>
                      {trip.likedActivities.length} liked activities
                    </Typography>
                  )}
                </Box>
              </ListItem>
              {index < trips.length - 1 && (
                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              )}
            </Box>
          ))
        )}
      </List>
    </Box>
  );
} 