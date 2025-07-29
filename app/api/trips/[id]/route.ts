import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TRIPS_FILE = path.join(process.cwd(), 'data', 'trips.json');

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updatedTrip = await request.json();
    
    const tripsData = fs.readFileSync(TRIPS_FILE, 'utf8');
    const trips = JSON.parse(tripsData);
    
    const tripIndex = trips.findIndex((trip: any) => trip.id === id);
    
    if (tripIndex === -1) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    trips[tripIndex] = { ...trips[tripIndex], ...updatedTrip };
    fs.writeFileSync(TRIPS_FILE, JSON.stringify(trips, null, 2));
    
    return NextResponse.json({ success: true, trip: trips[tripIndex] });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}