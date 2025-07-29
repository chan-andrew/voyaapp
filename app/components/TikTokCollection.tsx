"use client";

import { useState, useMemo } from 'react';
import { Box, Typography, Button, Paper, Chip, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

interface TikTokCollectionProps {
  activities: TikTokActivity[];
  onBack: () => void;
  onActivitySelect?: (activity: TikTokActivity) => void;
}

export default function TikTokCollection({ activities, onBack, onActivitySelect }: TikTokCollectionProps) {
  const [selectedActivity, setSelectedActivity] = useState<TikTokActivity | null>(null);

  // Group activities by location (major city or country)
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: TikTokActivity[] } = {};
    
    activities.forEach(activity => {
      const location = activity.location;
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(activity);
    });

    return groups;
  }, [activities]);

  const handleActivityClick = (activity: TikTokActivity) => {
    setSelectedActivity(activity);
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button
          onClick={onBack}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 2,
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          ← Back to Dashboard
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#ff1493' }}>
          📱 TikTok Collection
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {activities.length} activities extracted from your TikTok videos
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {Object.keys(groupedActivities).length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2 }}>
              No TikTok activities yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              Upload some TikTok videos to start building your collection
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            {Object.entries(groupedActivities).map(([location, locationActivities]) => (
              <Accordion
                key={location}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  mb: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                  sx={{
                    backgroundColor: 'rgba(255, 20, 147, 0.1)',
                    borderRadius: '12px 12px 0 0',
                    '&.Mui-expanded': {
                      borderRadius: '12px 12px 0 0',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      📍 {location}
                    </Typography>
                    <Chip 
                      label={`${locationActivities.length} activities`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 20, 147, 0.3)',
                        color: 'white',
                        fontSize: '11px'
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    {locationActivities.map((activity) => (
                      <Grid item xs={12} md={6} lg={4} key={activity.id}>
                        <Paper
                          sx={{
                            p: 2,
                            backgroundColor: selectedActivity?.id === activity.id 
                              ? 'rgba(255, 20, 147, 0.2)' 
                              : 'rgba(255, 255, 255, 0.05)',
                            border: selectedActivity?.id === activity.id
                              ? '2px solid #ff1493'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            height: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 20, 147, 0.1)',
                              borderColor: 'rgba(255, 20, 147, 0.3)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                          onClick={() => handleActivityClick(activity)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" sx={{ 
                              color: 'white', 
                              fontWeight: 600, 
                              fontSize: '16px',
                              lineHeight: 1.2,
                              flex: 1
                            }}>
                              {activity.name}
                            </Typography>
                            <Chip 
                              label={activity.category} 
                              size="small"
                              sx={{ 
                                backgroundColor: 'rgba(102, 126, 234, 0.3)',
                                color: 'white',
                                fontSize: '10px',
                                ml: 1
                              }}
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)', 
                            mb: 2,
                            fontSize: '13px',
                            lineHeight: 1.4,
                            flex: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {activity.description}
                          </Typography>
                          
                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '11px',
                            mt: 'auto'
                          }}>
                            Added {new Date(activity.createdAt).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>

      {/* Selected Activity Details */}
      {selectedActivity && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            p: 3,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedActivity.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                  📍 {selectedActivity.location}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  maxWidth: '800px'
                }}>
                  <strong>Transcription:</strong> {selectedActivity.transcription}
                </Typography>
              </Box>
              <Button
                onClick={() => setSelectedActivity(null)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  minWidth: 'auto',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                ✕
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
}