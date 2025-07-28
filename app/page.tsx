"use client";

import Image from "next/image";
import { Button, TextField, Box, Typography, List, ListItem, ListItemText, Paper } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import ActivityCard from "./components/ActivityCard";
import PastTripsSidebar from "./components/PastTripsSidebar";

interface Suggestion {
  id: string;
  name: string;
  description: string;
  type: string;
  fullDescription: string;
}

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
  destination: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  likedActivities: Activity[];
  dislikedActivities: Activity[];
  preferences?: {
    likedCategories: string[];
    dislikedCategories: string[];
    preferredDurations: string[];
    preferredTimes: string[];
    totalLiked: number;
    totalDisliked: number;
  };
}

export default function Home() {
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [showActivityCards, setShowActivityCards] = useState(false);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [likedActivities, setLikedActivities] = useState<Activity[]>([]);
  const [dislikedActivities, setDislikedActivities] = useState<Activity[]>([]);
  const [isGeneratingActivities, setIsGeneratingActivities] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const justSelectedSuggestion = useRef(false);

  // Load trips on component mount
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips');
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const handleLogin = () => {
    setShowTripPlanner(true);
  };

  const handleBackToLogin = () => {
    setShowTripPlanner(false);
    setShowActivityCards(false);
    setDestination("");
    setStartDate("");
    setEndDate("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActivities([]);
    setCurrentActivityIndex(0);
    setLikedActivities([]);
    setDislikedActivities([]);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinEndDate = () => {
    return startDate || getMinDate();
  };

  // Debounced search function
  useEffect(() => {
    console.log('Destination changed:', destination);
    
    // Don't fetch suggestions if we just selected one
    if (justSelectedSuggestion.current) {
      justSelectedSuggestion.current = false;
      return;
    }
    
    const timeoutId = setTimeout(() => {
      if (destination.length >= 1) {
        console.log('Calling fetchSuggestions with:', destination);
        fetchSuggestions(destination);
      } else {
        console.log('Clearing suggestions - destination too short');
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [destination]);

  const fetchSuggestions = async (input: string) => {
    console.log('Fetching suggestions for:', input);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await response.json();
      
      console.log('API response:', response.status, data);
      
      if (response.ok) {
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
        console.log('Suggestions set:', data.suggestions);
      } else {
        console.log('API error:', data.error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    justSelectedSuggestion.current = true; // Prevent fetching suggestions on destination change
    setDestination(suggestion.fullDescription);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]); // Clear suggestions to prevent reopening
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveTrip = async () => {
    if (!destination) return;

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          likedActivities,
          dislikedActivities,
        }),
      });

      if (response.ok) {
        await fetchTrips(); // Refresh trips list
      }
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const handleGenerateActivities = async () => {
    if (!destination) return;

    console.log('Generating activities for:', destination);
    setIsGeneratingActivities(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination, startDate, endDate }),
      });

      const data = await response.json();
      console.log('Activities API response:', response.status, data);
      
      if (response.ok && data.activities) {
        console.log('Setting activities:', data.activities);
        setActivities(data.activities);
        setCurrentActivityIndex(0);
        setLikedActivities([]);
        setDislikedActivities([]);
        setShowActivityCards(true);
        console.log('Activity cards should now be visible');
      } else {
        console.error('Failed to generate activities:', data.error);
      }
    } catch (error) {
      console.error('Error generating activities:', error);
    } finally {
      setIsGeneratingActivities(false);
    }
  };

  const handleActivitySwipe = (direction: 'left' | 'right') => {
    const currentActivity = activities[currentActivityIndex];
    
    if (direction === 'right') {
      setLikedActivities(prev => [...prev, currentActivity]);
    } else {
      setDislikedActivities(prev => [...prev, currentActivity]);
    }

    // Move to next activity
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(prev => prev + 1);
    } else {
      // All activities completed
      setTimeout(() => {
        handleSaveTrip();
        setShowActivityCards(false);
        setShowTripPlanner(false);
        // Reset for next trip
        setDestination("");
        setStartDate("");
        setEndDate("");
        setActivities([]);
        setCurrentActivityIndex(0);
        setLikedActivities([]);
        setDislikedActivities([]);
      }, 500); // Small delay to let the last card animate out
    }
  };

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    setDestination(trip.destination);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setLikedActivities(trip.likedActivities);
    setDislikedActivities(trip.dislikedActivities);
  };

  if (!showTripPlanner) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-center flex flex-col items-center gap-10">
          <div className="mb-5">
            <Image
              src="/Frame 14.png"
              alt="VOYA Logo"
              width={120}
              height={120}
              className="drop-shadow-[0_4px_8px_rgba(255,255,255,0.1)]"
            />
          </div>
          <div className="flex flex-col items-center gap-5">
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: 600,
                borderRadius: '50px',
                textTransform: 'none',
                minWidth: '200px',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showActivityCards) {
    console.log('Rendering activity cards. Activities:', activities, 'Current index:', currentActivityIndex);
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <PastTripsSidebar 
          trips={trips}
          onTripSelect={handleTripSelect}
          selectedTripId={selectedTrip?.id}
        />
        
        <div className="flex-1 flex justify-center items-center" style={{ marginLeft: '280px' }}>
          <Box sx={{ position: 'relative', width: '300px', height: '400px' }}>
            {activities.length > 0 && currentActivityIndex < activities.length ? (
              <ActivityCard
                key={currentActivityIndex}
                activity={activities[currentActivityIndex]}
                onSwipe={handleActivitySwipe}
                isActive={true}
              />
            ) : (
              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                No activities loaded
              </Typography>
            )}
            
            {isGeneratingActivities && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6">Generating activities...</Typography>
              </Box>
            )}
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <PastTripsSidebar 
        trips={trips}
        onTripSelect={handleTripSelect}
        selectedTripId={selectedTrip?.id}
      />
      
      <div className="flex-1 flex justify-center items-center p-8" style={{ marginLeft: '280px' }}>
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title Section */}
          <div className="text-center mb-12">
            <Image
              src="/Frame 14.png"
              alt="VOYA Logo"
              width={80}
              height={80}
              className="mx-auto mb-6 animate-fade-in"
            />
            <Typography 
              variant="h4" 
              component="h1" 
              className="text-center font-bold text-white mb-8 animate-fade-in"
              sx={{
                animation: 'fadeIn 0.8s ease-in-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              Plan a new trip
            </Typography>
          </div>

          {/* Destination Section */}
          <div className="space-y-4 animate-fade-in relative" style={{ animationDelay: '0.2s' }}>
            <Typography 
              variant="h6" 
              className="font-bold text-white"
              sx={{
                animation: 'slideInLeft 0.6s ease-out',
                '@keyframes slideInLeft': {
                  '0%': { opacity: 0, transform: 'translateX(-30px)' },
                  '100%': { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              Where do you want to go?
            </Typography>
            <div className="relative" ref={inputRef}>
              <TextField
                fullWidth
                placeholder="e.g. Paris, Hawaii, Japan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                    '& input': {
                      color: 'white',
                    },
                    '& input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                    },
                  },
                }}
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <Paper
                  ref={suggestionsRef}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    mt: 1,
                    maxHeight: '300px',
                    overflow: 'auto',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {suggestions.map((suggestion, index) => (
                      <ListItem
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: index === selectedIndex ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          },
                          borderBottom: index < suggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                                {suggestion.name}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  backgroundColor: 'rgba(102, 126, 234, 0.3)', 
                                  px: 1, 
                                  py: 0.5, 
                                  borderRadius: '4px',
                                  color: 'white',
                                  fontSize: '11px'
                                }}
                              >
                                {suggestion.type}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}>
                              {suggestion.description}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
              
              {isLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: '16px',
                    transform: 'translateY(-50%)',
                    color: '#667eea',
                  }}
                >
                  <Typography variant="body2">Loading...</Typography>
                </Box>
              )}
            </div>
            {!destination && !showSuggestions && (
              <Typography variant="body2" color="error" className="animate-fade-in">
                Choose a destination to start planning
              </Typography>
            )}
          </div>

          {/* Dates Section */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Typography 
              variant="h6" 
              className="font-bold text-white"
              sx={{
                animation: 'slideInLeft 0.6s ease-out',
                animationDelay: '0.4s',
              }}
            >
              Dates (optional)
            </Typography>
            <div className="flex gap-2">
              <TextField
                type="date"
                label=""
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                inputProps={{
                  min: getMinDate(),
                }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                    '& input': {
                      color: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    display: 'none',
                  },
                }}
              />
              <TextField
                type="date"
                label=""
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                inputProps={{
                  min: getMinEndDate(),
                }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                    '& input': {
                      color: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    display: 'none',
                  },
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleSaveTrip}
              disabled={!destination}
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                borderRadius: '25px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                padding: '8px 16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#764ba2',
                  color: '#764ba2',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              I know what I want to do
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateActivities}
              disabled={!destination || isGeneratingActivities}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '25px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                padding: '8px 16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {isGeneratingActivities ? 'Generating...' : 'Give me some ideas please'}
            </Button>
          </div>

          {/* Back to Login Button */}
          <div className="pt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Button
              variant="text"
              fullWidth
              onClick={handleBackToLogin}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '25px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                padding: '8px 16px',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Back to login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
