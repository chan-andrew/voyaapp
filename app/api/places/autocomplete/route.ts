import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get('input');

  console.log('API called with input:', input);

  if (!input) {
    console.log('No input provided');
    return NextResponse.json({ error: 'Input parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  console.log('API Key exists:', !!apiKey);
  
  if (!apiKey) {
    console.log('Google Maps API key not configured');
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  try {
    // Remove types restriction to get all location types including countries
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;
    
    console.log('Calling Google API with URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();

    console.log('Google API response status:', data.status);
    console.log('Google API response:', data);

    if (data.status === 'OK') {
      // Transform the data to match the expected format and filter out establishments
      const suggestions = data.predictions
        .filter((prediction: any) => {
          // Filter out establishments but be more inclusive for location types
          const types = prediction.types || [];
          
          // Exclude establishment types
          const isEstablishment = types.includes('establishment') || 
                                 types.includes('point_of_interest') ||
                                 types.includes('business') ||
                                 types.includes('store') ||
                                 types.includes('restaurant') ||
                                 types.includes('lodging') ||
                                 types.includes('food') ||
                                 types.includes('health');
          
          // Include any location that's not an establishment
          return !isEstablishment;
        })
        .map((prediction: any) => ({
          id: prediction.place_id,
          name: prediction.structured_formatting?.main_text || prediction.description,
          description: prediction.structured_formatting?.secondary_text || '',
          type: getLocationType(prediction.types),
          fullDescription: prediction.description
        }));

      console.log('Transformed suggestions:', suggestions);

      return NextResponse.json({ suggestions });
    } else {
      console.log('Google API error:', data.error_message);
      return NextResponse.json({ error: data.error_message || 'No results found' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error calling Google Places API:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

function getLocationType(types: string[]): string {
  if (types.includes('country')) return 'Country';
  if (types.includes('administrative_area_level_1')) return 'State/Province';
  if (types.includes('locality')) return 'City';
  if (types.includes('sublocality')) return 'District';
  if (types.includes('natural_feature')) return 'Natural Feature';
  if (types.includes('establishment')) return 'Establishment';
  if (types.includes('geographic')) return 'Region';
  return 'Location';
} 