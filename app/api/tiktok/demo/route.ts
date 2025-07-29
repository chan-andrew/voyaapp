import { NextRequest, NextResponse } from 'next/server';

// Demo TikTok activities for testing without FFmpeg
const demoActivities = [
  {
    id: '1',
    name: 'Sushi Making Class',
    location: 'Tokyo, Japan',
    description: 'Learn authentic sushi making from a master chef in Tokyo. Perfect for food lovers!',
    category: 'Food',
    transcription: 'OMG guys, I just took the most amazing sushi making class in Tokyo! The chef taught us how to make perfect sushi rice and roll amazing nigiri. This is a must-do if you\'re visiting Japan!',
    videoPath: '/demo/sushi-class.mp4',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bungee Jumping',
    location: 'Queenstown, New Zealand',
    description: 'Heart-pounding bungee jump from the famous Kawarau Gorge Bridge.',
    category: 'Adventure',
    transcription: 'Just did the most insane bungee jump in Queenstown! My heart is still racing! The views are incredible and the adrenaline rush is unmatched. If you\'re looking for an adventure, this is it!',
    videoPath: '/demo/bungee-jump.mp4',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Street Art Tour',
    location: 'Berlin, Germany',
    description: 'Explore the vibrant street art scene in Berlin\'s alternative neighborhoods.',
    category: 'Culture',
    transcription: 'Berlin\'s street art is absolutely mind-blowing! Just finished this incredible walking tour through Kreuzberg and Friedrichshain. Every wall tells a story and the creativity here is off the charts!',
    videoPath: '/demo/street-art.mp4',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Rooftop Bar Experience',
    location: 'Bangkok, Thailand',
    description: 'Sunset drinks with panoramic city views from one of Bangkok\'s sky bars.',
    category: 'Nightlife',
    transcription: 'This rooftop bar in Bangkok has the most incredible sunset views! The cocktails are amazing and you can see the entire city skyline. Perfect spot for a romantic evening or celebration!',
    videoPath: '/demo/rooftop-bar.mp4',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Local Market Food Tour',
    location: 'Marrakech, Morocco',
    description: 'Taste authentic Moroccan cuisine at the bustling local markets.',
    category: 'Food',
    transcription: 'The food at Marrakech markets is incredible! Just tried the best tagine of my life and the spices here are so fresh. Don\'t miss the mint tea - it\'s a whole experience!',
    videoPath: '/demo/market-tour.mp4',
    createdAt: new Date().toISOString(),
  }
];

export async function POST(request: NextRequest) {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a random demo activity
    const randomActivity = demoActivities[Math.floor(Math.random() * demoActivities.length)];
    
    // Create a new activity with unique ID and current timestamp
    const newActivity = {
      ...randomActivity,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      activity: newActivity,
      message: 'Demo TikTok activity generated (FFmpeg not required)',
      isDemo: true
    });

  } catch (error) {
    console.error('Demo TikTok error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate demo activity' 
    }, { status: 500 });
  }
}