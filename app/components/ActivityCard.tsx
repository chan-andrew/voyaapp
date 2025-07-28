"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface ActivityCardProps {
  activity: {
    name: string;
    category: string;
    duration: string;
    bestTime: string;
    whyRecommended: string;
    practicalInfo: string;
  };
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
}

export default function ActivityCard({ activity, onSwipe, isActive }: ActivityCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isActive || !isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isActive || !isDragging) return;
    setIsDragging(false);
    
    const threshold = window.innerWidth * 0.2; // 20% of screen width
    if (Math.abs(dragOffset.x) > threshold) {
      // Animate card off screen before calling onSwipe
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      const exitDistance = window.innerWidth * 1.5;
      setDragOffset({ 
        x: direction === 'right' ? exitDistance : -exitDistance, 
        y: dragOffset.y 
      });
      
      // Delay the onSwipe call to allow animation
      setTimeout(() => {
        onSwipe(direction);
        setDragOffset({ x: 0, y: 0 });
      }, 300);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isActive || !isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isActive || !isDragging) return;
    setIsDragging(false);
    
    const threshold = window.innerWidth * 0.2;
    if (Math.abs(dragOffset.x) > threshold) {
      // Animate card off screen before calling onSwipe
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      const exitDistance = window.innerWidth * 1.5;
      setDragOffset({ 
        x: direction === 'right' ? exitDistance : -exitDistance, 
        y: dragOffset.y 
      });
      
      // Delay the onSwipe call to allow animation
      setTimeout(() => {
        onSwipe(direction);
        setDragOffset({ x: 0, y: 0 });
      }, 300);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && isActive) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        setDragOffset({ x: deltaX, y: deltaY });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging && isActive) {
        setIsDragging(false);
        const threshold = window.innerWidth * 0.2;
        if (Math.abs(dragOffset.x) > threshold) {
          // Animate card off screen before calling onSwipe
          const direction = dragOffset.x > 0 ? 'right' : 'left';
          const exitDistance = window.innerWidth * 1.5;
          setDragOffset({ 
            x: direction === 'right' ? exitDistance : -exitDistance, 
            y: dragOffset.y 
          });
          
          // Delay the onSwipe call to allow animation
          setTimeout(() => {
            onSwipe(direction);
            setDragOffset({ x: 0, y: 0 });
          }, 300);
        } else {
          setDragOffset({ x: 0, y: 0 });
        }
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isActive, startPos, dragOffset, onSwipe]);

  const rotation = (dragOffset.x / window.innerWidth) * 15; // Max 15 degrees rotation
  const opacity = 1; // Always full opacity for visible card
  const scale = 1; // Always full scale

  // Calculate swipe progress for color overlay
  const swipeProgress = Math.abs(dragOffset.x) / (window.innerWidth * 0.2);
  const isSwipingRight = dragOffset.x > 50; // Minimum threshold for showing indicator
  const isSwipingLeft = dragOffset.x < -50;

  return (
    <Card
      ref={cardRef}
      sx={{
        position: 'absolute',
        width: '300px',
        height: '400px',
        cursor: isActive ? 'grab' : 'default',
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
        transition: isDragging ? 'none' : 'all 0.3s ease',
        opacity,
        userSelect: 'none',
        touchAction: 'none',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: 'none',
        '&:active': {
          cursor: isActive ? 'grabbing' : 'default',
        },
        // Remove MUI Card default styles
        '& .MuiCard-root': {
          borderRadius: '16px',
        },
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '24px !important',
          '&:last-child': {
            paddingBottom: '24px !important',
          },
        }}
      >
        {/* Swipe overlay indicators */}
        {isSwipingRight && swipeProgress > 0.1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, rgba(34, 197, 94, ${swipeProgress * 0.8}) 0%, rgba(34, 197, 94, ${swipeProgress * 0.4}) 100%)`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
              LIKE
            </Typography>
          </Box>
        )}

        {isSwipingLeft && swipeProgress > 0.1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, rgba(239, 68, 68, ${swipeProgress * 0.8}) 0%, rgba(239, 68, 68, ${swipeProgress * 0.4}) 100%)`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
              NOPE
            </Typography>
          </Box>
        )}

        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, zIndex: 2 }}>
          {activity.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, zIndex: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              px: 1, 
              py: 0.5, 
              borderRadius: '4px',
              fontSize: '11px'
            }}
          >
            {activity.category}
          </Typography>
          <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
            {activity.duration}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9, zIndex: 2 }}>
          {activity.whyRecommended}
        </Typography>
        
        <Box sx={{ textAlign: 'left', width: '100%', zIndex: 2 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
            <strong>Best Time:</strong> {activity.bestTime}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
            <strong>Practical Info:</strong> {activity.practicalInfo}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 