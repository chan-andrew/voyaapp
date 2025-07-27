import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TRIPS_FILE = path.join(process.cwd(), 'data', 'trips.json');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize trips file if it doesn't exist
if (!fs.existsSync(TRIPS_FILE)) {
  fs.writeFileSync(TRIPS_FILE, JSON.stringify([]));
}

export async function GET() {
  try {
    const tripsData = fs.readFileSync(TRIPS_FILE, 'utf8');
    const trips = JSON.parse(tripsData);
    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error reading trips:', error);
    return NextResponse.json({ trips: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, startDate, endDate, likedActivities = [], dislikedActivities = [] } = body;

    const tripsData = fs.readFileSync(TRIPS_FILE, 'utf8');
    const trips = JSON.parse(tripsData);

    const newTrip = {
      id: Date.now().toString(),
      destination,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      likedActivities,
      dislikedActivities
    };

    trips.push(newTrip);
    fs.writeFileSync(TRIPS_FILE, JSON.stringify(trips, null, 2));

    return NextResponse.json({ success: true, trip: newTrip });
  } catch (error) {
    console.error('Error saving trip:', error);
    return NextResponse.json({ error: 'Failed to save trip' }, { status: 500 });
  }
} 