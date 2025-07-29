"use client";

import { Box, Typography, List, ListItem, ListItemText, Divider, Button, Input } from '@mui/material';
import { useState, useRef } from 'react';
import { uploadTikTokVideo } from '../lib/tiktok-actions';
import { testUpload } from '../lib/test-upload';

type Activity = {
  name: string;
  category: string;
  duration: string;
  bestTime: string;
  whyRecommended: string;
  practicalInfo: string;
};

interface Trip {
  id: string;
  user: string;
  destination: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  likedActivities: Activity[];
  dislikedActivities: Activity[];
}

interface TikTokActivity {
  id: string;
  name: string;
  location: string;
  description: string;
  category: string;
  transcription: string;
  videoPath: string;
  createdAt: string;
}

interface PastTripsSidebarProps {
  trips: Trip[];
  onTripSelect: (trip: Trip) => void;
  selectedTripId?: string;
  onTikTokCollectionView?: () => void;
  tiktokActivities: TikTokActivity[];
  onTikTokActivityAdd: (activity: TikTokActivity) => void;
}

export default function PastTripsSidebar({ trips, onTripSelect, selectedTripId, onTikTokCollectionView, tiktokActivities, onTikTokActivityAdd }: PastTripsSidebarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleTikTokUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('video/mp4')) {
      alert('Please upload an MP4 video file');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('Preparing to upload file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const formData = new FormData();
      formData.append('video', file);
      
      console.log('FormData created, sending to API route...');

      const response = await fetch('/api/tiktok/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response received:', response.status, response.statusText);

      const data = await response.json();
      
      if (response.ok) {
        // Add the new TikTok activity to the list
        onTikTokActivityAdd(data.activity);
        alert('TikTok video processed successfully!');
      } else {
        console.error('API returned error:', data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading TikTok:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to upload TikTok video: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box
      sx={{
        width: '280px',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
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

      <List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
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

      {/* TikTok Collection Section */}
      <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
          TikTok Collection
        </Typography>
        
        {tiktokActivities.length > 0 && (
          <Button
            onClick={onTikTokCollectionView}
            sx={{
              width: '100%',
              mb: 1,
              backgroundColor: 'rgba(255, 20, 147, 0.1)',
              color: '#ff1493',
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '13px',
              '&:hover': {
                backgroundColor: 'rgba(255, 20, 147, 0.2)',
              },
            }}
          >
            View Collection ({tiktokActivities.length})
          </Button>
        )}

        <input
          type="file"
          accept="video/mp4"
          onChange={handleTikTokUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 20, 147, 0.2)',
            color: 'white',
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '13px',
            border: '1px solid rgba(255, 20, 147, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(255, 20, 147, 0.3)',
            },
            '&:disabled': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {isUploading ? 'Processing...' : '📱 Upload TikTok'}
        </Button>
      </Box>
    </Box>
  );
} 