"use client";

import { useState } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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

interface TripDashboardProps {
  trip: Trip;
  onBack: () => void;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export default function TripDashboard({ trip, onBack, onUpdateTrip }: TripDashboardProps) {
  const [likedActivities, setLikedActivities] = useState(trip.likedActivities);
  const [dislikedActivities, setDislikedActivities] = useState(trip.dislikedActivities);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the activity being moved
    let activity: Activity | null = null;
    let sourceList: Activity[] = [];
    let setSourceList: (activities: Activity[]) => void = () => {};

    if (source.droppableId === 'liked') {
      sourceList = [...likedActivities];
      setSourceList = setLikedActivities;
      activity = sourceList[source.index];
    } else {
      sourceList = [...dislikedActivities];
      setSourceList = setDislikedActivities;
      activity = sourceList[source.index];
    }

    if (!activity) return;

    // Remove from source
    sourceList.splice(source.index, 1);
    setSourceList(sourceList);

    // Add to destination
    if (destination.droppableId === 'liked') {
      const newLiked = [...likedActivities];
      if (source.droppableId === 'disliked') {
        newLiked.splice(destination.index, 0, activity);
      } else {
        newLiked.splice(destination.index, 0, activity);
      }
      setLikedActivities(newLiked);
    } else {
      const newDisliked = [...dislikedActivities];
      if (source.droppableId === 'liked') {
        newDisliked.splice(destination.index, 0, activity);
      } else {
        newDisliked.splice(destination.index, 0, activity);
      }
      setDislikedActivities(newDisliked);
    }

    // Update the trip
    const updatedTrip = {
      ...trip,
      likedActivities: destination.droppableId === 'liked' ? 
        (source.droppableId === 'liked' ? sourceList : [...likedActivities, activity]) :
        (source.droppableId === 'liked' ? sourceList : likedActivities),
      dislikedActivities: destination.droppableId === 'disliked' ? 
        (source.droppableId === 'disliked' ? sourceList : [...dislikedActivities, activity]) :
        (source.droppableId === 'disliked' ? sourceList : dislikedActivities)
    };
    
    onUpdateTrip(updatedTrip);
  };

  const ActivityItem = ({ activity, index }: { activity: Activity; index: number }) => (
    <Draggable draggableId={`${activity.name}-${index}`} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            p: 2,
            mb: 1,
            backgroundColor: snapshot.isDragging ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            cursor: 'grab',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(102, 126, 234, 0.3)',
            },
            '&:active': {
              cursor: 'grabbing',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
              {activity.name}
            </Typography>
            <Chip 
              label={activity.category} 
              size="small"
              sx={{ 
                backgroundColor: 'rgba(102, 126, 234, 0.3)',
                color: 'white',
                fontSize: '11px'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontSize: '13px' }}>
            {activity.whyRecommended.length > 100 ? 
              `${activity.whyRecommended.substring(0, 100)}...` : 
              activity.whyRecommended
            }
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              <strong>Duration:</strong> {activity.duration}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              <strong>Best Time:</strong> {activity.bestTime}
            </Typography>
          </Box>
        </Paper>
      )}
    </Draggable>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Button
          onClick={onBack}
          sx={{
            position: 'absolute',
            left: '24px',
            top: '24px',
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          ← Back to Dashboard
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          {trip.destination}
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {trip.startDate && trip.endDate ? 
            `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}` :
            'Flexible dates'
          }
        </Typography>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, maxWidth: '1200px', mx: 'auto' }}>
          {/* Liked Activities */}
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              ✓ Activities You Liked ({likedActivities.length})
            </Typography>
            <Droppable droppableId="liked">
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: '400px',
                    p: 2,
                    border: '2px dashed',
                    borderColor: snapshot.isDraggingOver ? '#22c55e' : 'rgba(34, 197, 94, 0.3)',
                    borderRadius: '16px',
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {likedActivities.map((activity, index) => (
                    <ActivityItem key={`liked-${activity.name}-${index}`} activity={activity} index={index} />
                  ))}
                  {provided.placeholder}
                  {likedActivities.length === 0 && (
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      textAlign: 'center',
                      mt: 4
                    }}>
                      Drag activities here that you want to do
                    </Typography>
                  )}
                </Box>
              )}
            </Droppable>
          </Box>

          {/* Disliked Activities */}
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              ✗ Activities You Passed On ({dislikedActivities.length})
            </Typography>
            <Droppable droppableId="disliked">
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: '400px',
                    p: 2,
                    border: '2px dashed',
                    borderColor: snapshot.isDraggingOver ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
                    borderRadius: '16px',
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {dislikedActivities.map((activity, index) => (
                    <ActivityItem key={`disliked-${activity.name}-${index}`} activity={activity} index={index} />
                  ))}
                  {provided.placeholder}
                  {dislikedActivities.length === 0 && (
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      textAlign: 'center',
                      mt: 4
                    }}>
                      Activities you don't want to do will appear here
                    </Typography>
                  )}
                </Box>
              )}
            </Droppable>
          </Box>
        </Box>
      </DragDropContext>
    </div>
  );
}