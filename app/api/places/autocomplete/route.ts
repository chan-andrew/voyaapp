import { NextRequest, NextResponse } from 'next/server';

function getMockSuggestions(input: string): any[] {
  const mockData = [
    // A
    { id: '1', name: 'Amsterdam', description: 'Netherlands', type: 'City', fullDescription: 'Amsterdam, Netherlands' },
    { id: '2', name: 'Australia', description: 'Country', type: 'Country', fullDescription: 'Australia' },
    { id: '3', name: 'Athens', description: 'Greece', type: 'City', fullDescription: 'Athens, Greece' },
    { id: '4', name: 'Argentina', description: 'Country', type: 'Country', fullDescription: 'Argentina' },
    { id: '5', name: 'Alaska', description: 'USA', type: 'State/Province', fullDescription: 'Alaska, USA' },
    
    // B
    { id: '6', name: 'Barcelona', description: 'Spain', type: 'City', fullDescription: 'Barcelona, Spain' },
    { id: '7', name: 'Brazil', description: 'Country', type: 'Country', fullDescription: 'Brazil' },
    { id: '8', name: 'Bangkok', description: 'Thailand', type: 'City', fullDescription: 'Bangkok, Thailand' },
    { id: '9', name: 'Berlin', description: 'Germany', type: 'City', fullDescription: 'Berlin, Germany' },
    { id: '10', name: 'Bali', description: 'Indonesia', type: 'Region', fullDescription: 'Bali, Indonesia' },
    
    // C
    { id: '11', name: 'Canada', description: 'Country', type: 'Country', fullDescription: 'Canada' },
    { id: '12', name: 'China', description: 'Country', type: 'Country', fullDescription: 'China' },
    { id: '13', name: 'California', description: 'USA', type: 'State/Province', fullDescription: 'California, USA' },
    { id: '14', name: 'Croatia', description: 'Country', type: 'Country', fullDescription: 'Croatia' },
    { id: '15', name: 'Cairo', description: 'Egypt', type: 'City', fullDescription: 'Cairo, Egypt' },
    
    // D
    { id: '16', name: 'Dubai', description: 'UAE', type: 'City', fullDescription: 'Dubai, UAE' },
    { id: '17', name: 'Denmark', description: 'Country', type: 'Country', fullDescription: 'Denmark' },
    { id: '18', name: 'Dublin', description: 'Ireland', type: 'City', fullDescription: 'Dublin, Ireland' },
    { id: '19', name: 'Delhi', description: 'India', type: 'City', fullDescription: 'Delhi, India' },
    { id: '20', name: 'Dominican Republic', description: 'Country', type: 'Country', fullDescription: 'Dominican Republic' },
    
    // E
    { id: '21', name: 'Egypt', description: 'Country', type: 'Country', fullDescription: 'Egypt' },
    { id: '22', name: 'England', description: 'UK', type: 'Country', fullDescription: 'England, UK' },
    { id: '23', name: 'Estonia', description: 'Country', type: 'Country', fullDescription: 'Estonia' },
    { id: '24', name: 'Edinburgh', description: 'Scotland, UK', type: 'City', fullDescription: 'Edinburgh, Scotland, UK' },
    { id: '25', name: 'Ecuador', description: 'Country', type: 'Country', fullDescription: 'Ecuador' },
    
    // F
    { id: '26', name: 'France', description: 'Country', type: 'Country', fullDescription: 'France' },
    { id: '27', name: 'Finland', description: 'Country', type: 'Country', fullDescription: 'Finland' },
    { id: '28', name: 'Florida', description: 'USA', type: 'State/Province', fullDescription: 'Florida, USA' },
    { id: '29', name: 'Florence', description: 'Italy', type: 'City', fullDescription: 'Florence, Italy' },
    { id: '30', name: 'Fiji', description: 'Country', type: 'Country', fullDescription: 'Fiji' },
    
    // G
    { id: '31', name: 'Germany', description: 'Country', type: 'Country', fullDescription: 'Germany' },
    { id: '32', name: 'Greece', description: 'Country', type: 'Country', fullDescription: 'Greece' },
    { id: '33', name: 'Geneva', description: 'Switzerland', type: 'City', fullDescription: 'Geneva, Switzerland' },
    { id: '34', name: 'Georgia', description: 'USA', type: 'State/Province', fullDescription: 'Georgia, USA' },
    { id: '35', name: 'Ghana', description: 'Country', type: 'Country', fullDescription: 'Ghana' },
    
    // H
    { id: '36', name: 'Hawaii', description: 'USA', type: 'State/Province', fullDescription: 'Hawaii, USA' },
    { id: '37', name: 'Hungary', description: 'Country', type: 'Country', fullDescription: 'Hungary' },
    { id: '38', name: 'Hong Kong', description: 'SAR China', type: 'Region', fullDescription: 'Hong Kong, SAR China' },
    { id: '39', name: 'Helsinki', description: 'Finland', type: 'City', fullDescription: 'Helsinki, Finland' },
    { id: '40', name: 'Houston', description: 'Texas, USA', type: 'City', fullDescription: 'Houston, Texas, USA' },
    
    // I
    { id: '41', name: 'Italy', description: 'Country', type: 'Country', fullDescription: 'Italy' },
    { id: '42', name: 'India', description: 'Country', type: 'Country', fullDescription: 'India' },
    { id: '43', name: 'Iceland', description: 'Country', type: 'Country', fullDescription: 'Iceland' },
    { id: '44', name: 'Ireland', description: 'Country', type: 'Country', fullDescription: 'Ireland' },
    { id: '45', name: 'Indonesia', description: 'Country', type: 'Country', fullDescription: 'Indonesia' },
    
    // J
    { id: '46', name: 'Japan', description: 'Country', type: 'Country', fullDescription: 'Japan' },
    { id: '47', name: 'Jamaica', description: 'Country', type: 'Country', fullDescription: 'Jamaica' },
    { id: '48', name: 'Jordan', description: 'Country', type: 'Country', fullDescription: 'Jordan' },
    { id: '49', name: 'Jakarta', description: 'Indonesia', type: 'City', fullDescription: 'Jakarta, Indonesia' },
    { id: '50', name: 'Jerusalem', description: 'Israel', type: 'City', fullDescription: 'Jerusalem, Israel' },
    
    // K
    { id: '51', name: 'Kenya', description: 'Country', type: 'Country', fullDescription: 'Kenya' },
    { id: '52', name: 'Korea', description: 'Country', type: 'Country', fullDescription: 'Korea' },
    { id: '53', name: 'Kuwait', description: 'Country', type: 'Country', fullDescription: 'Kuwait' },
    { id: '54', name: 'Kyoto', description: 'Japan', type: 'City', fullDescription: 'Kyoto, Japan' },
    { id: '55', name: 'Kiev', description: 'Ukraine', type: 'City', fullDescription: 'Kiev, Ukraine' },
    
    // L
    { id: '56', name: 'London', description: 'England, UK', type: 'City', fullDescription: 'London, England, UK' },
    { id: '57', name: 'Los Angeles', description: 'California, USA', type: 'City', fullDescription: 'Los Angeles, California, USA' },
    { id: '58', name: 'Latvia', description: 'Country', type: 'Country', fullDescription: 'Latvia' },
    { id: '59', name: 'Lithuania', description: 'Country', type: 'Country', fullDescription: 'Lithuania' },
    { id: '60', name: 'Lebanon', description: 'Country', type: 'Country', fullDescription: 'Lebanon' },
    
    // M
    { id: '61', name: 'Mexico', description: 'Country', type: 'Country', fullDescription: 'Mexico' },
    { id: '62', name: 'Morocco', description: 'Country', type: 'Country', fullDescription: 'Morocco' },
    { id: '63', name: 'Madrid', description: 'Spain', type: 'City', fullDescription: 'Madrid, Spain' },
    { id: '64', name: 'Munich', description: 'Germany', type: 'City', fullDescription: 'Munich, Germany' },
    { id: '65', name: 'Malaysia', description: 'Country', type: 'Country', fullDescription: 'Malaysia' },
    
    // N
    { id: '66', name: 'Netherlands', description: 'Country', type: 'Country', fullDescription: 'Netherlands' },
    { id: '67', name: 'Norway', description: 'Country', type: 'Country', fullDescription: 'Norway' },
    { id: '68', name: 'New York', description: 'USA', type: 'State/Province', fullDescription: 'New York, USA' },
    { id: '69', name: 'Nepal', description: 'Country', type: 'Country', fullDescription: 'Nepal' },
    { id: '70', name: 'Nigeria', description: 'Country', type: 'Country', fullDescription: 'Nigeria' },
    
    // O
    { id: '71', name: 'Oman', description: 'Country', type: 'Country', fullDescription: 'Oman' },
    { id: '72', name: 'Ohio', description: 'USA', type: 'State/Province', fullDescription: 'Ohio, USA' },
    { id: '73', name: 'Oregon', description: 'USA', type: 'State/Province', fullDescription: 'Oregon, USA' },
    { id: '74', name: 'Oslo', description: 'Norway', type: 'City', fullDescription: 'Oslo, Norway' },
    { id: '75', name: 'Oxford', description: 'England, UK', type: 'City', fullDescription: 'Oxford, England, UK' },
    
    // P
    { id: '76', name: 'Paris', description: 'France', type: 'City', fullDescription: 'Paris, France' },
    { id: '77', name: 'Portugal', description: 'Country', type: 'Country', fullDescription: 'Portugal' },
    { id: '78', name: 'Poland', description: 'Country', type: 'Country', fullDescription: 'Poland' },
    { id: '79', name: 'Peru', description: 'Country', type: 'Country', fullDescription: 'Peru' },
    { id: '80', name: 'Philippines', description: 'Country', type: 'Country', fullDescription: 'Philippines' },
    
    // Q
    { id: '81', name: 'Qatar', description: 'Country', type: 'Country', fullDescription: 'Qatar' },
    { id: '82', name: 'Quebec', description: 'Canada', type: 'State/Province', fullDescription: 'Quebec, Canada' },
    { id: '83', name: 'Queensland', description: 'Australia', type: 'State/Province', fullDescription: 'Queensland, Australia' },
    { id: '84', name: 'Quito', description: 'Ecuador', type: 'City', fullDescription: 'Quito, Ecuador' },
    { id: '85', name: 'Queenstown', description: 'New Zealand', type: 'City', fullDescription: 'Queenstown, New Zealand' },
    
    // R
    { id: '86', name: 'Rome', description: 'Italy', type: 'City', fullDescription: 'Rome, Italy' },
    { id: '87', name: 'Russia', description: 'Country', type: 'Country', fullDescription: 'Russia' },
    { id: '88', name: 'Romania', description: 'Country', type: 'Country', fullDescription: 'Romania' },
    { id: '89', name: 'Rio de Janeiro', description: 'Brazil', type: 'City', fullDescription: 'Rio de Janeiro, Brazil' },
    { id: '90', name: 'Rwanda', description: 'Country', type: 'Country', fullDescription: 'Rwanda' },
    
    // S
    { id: '91', name: 'Spain', description: 'Country', type: 'Country', fullDescription: 'Spain' },
    { id: '92', name: 'Sweden', description: 'Country', type: 'Country', fullDescription: 'Sweden' },
    { id: '93', name: 'Switzerland', description: 'Country', type: 'Country', fullDescription: 'Switzerland' },
    { id: '94', name: 'Singapore', description: 'Country', type: 'Country', fullDescription: 'Singapore' },
    { id: '95', name: 'Sydney', description: 'Australia', type: 'City', fullDescription: 'Sydney, Australia' },
    
    // T
    { id: '96', name: 'Thailand', description: 'Country', type: 'Country', fullDescription: 'Thailand' },
    { id: '97', name: 'Turkey', description: 'Country', type: 'Country', fullDescription: 'Turkey' },
    { id: '98', name: 'Tokyo', description: 'Japan', type: 'City', fullDescription: 'Tokyo, Japan' },
    { id: '99', name: 'Texas', description: 'USA', type: 'State/Province', fullDescription: 'Texas, USA' },
    { id: '100', name: 'Tunisia', description: 'Country', type: 'Country', fullDescription: 'Tunisia' },
    
    // U
    { id: '101', name: 'United States', description: 'Country', type: 'Country', fullDescription: 'United States' },
    { id: '102', name: 'United Kingdom', description: 'Country', type: 'Country', fullDescription: 'United Kingdom' },
    { id: '103', name: 'Ukraine', description: 'Country', type: 'Country', fullDescription: 'Ukraine' },
    { id: '104', name: 'Utah', description: 'USA', type: 'State/Province', fullDescription: 'Utah, USA' },
    { id: '105', name: 'Uruguay', description: 'Country', type: 'Country', fullDescription: 'Uruguay' },
    
    // V
    { id: '106', name: 'Vietnam', description: 'Country', type: 'Country', fullDescription: 'Vietnam' },
    { id: '107', name: 'Venezuela', description: 'Country', type: 'Country', fullDescription: 'Venezuela' },
    { id: '108', name: 'Vienna', description: 'Austria', type: 'City', fullDescription: 'Vienna, Austria' },
    { id: '109', name: 'Venice', description: 'Italy', type: 'City', fullDescription: 'Venice, Italy' },
    { id: '110', name: 'Vancouver', description: 'Canada', type: 'City', fullDescription: 'Vancouver, Canada' },
    
    // W
    { id: '111', name: 'Washington', description: 'USA', type: 'State/Province', fullDescription: 'Washington, USA' },
    { id: '112', name: 'Wales', description: 'UK', type: 'Country', fullDescription: 'Wales, UK' },
    { id: '113', name: 'Warsaw', description: 'Poland', type: 'City', fullDescription: 'Warsaw, Poland' },
    { id: '114', name: 'Wisconsin', description: 'USA', type: 'State/Province', fullDescription: 'Wisconsin, USA' },
    { id: '115', name: 'Wyoming', description: 'USA', type: 'State/Province', fullDescription: 'Wyoming, USA' },
    
    // X, Y, Z
    { id: '116', name: 'Yemen', description: 'Country', type: 'Country', fullDescription: 'Yemen' },
    { id: '117', name: 'Zurich', description: 'Switzerland', type: 'City', fullDescription: 'Zurich, Switzerland' },
    { id: '118', name: 'Zimbabwe', description: 'Country', type: 'Country', fullDescription: 'Zimbabwe' },
    { id: '119', name: 'Zambia', description: 'Country', type: 'Country', fullDescription: 'Zambia' }
  ];

  // Filter based on input (case-insensitive)
  const filtered = mockData.filter(item => 
    item.name.toLowerCase().includes(input.toLowerCase()) ||
    item.description.toLowerCase().includes(input.toLowerCase())
  );

  return filtered.slice(0, 10); // Return max 10 results
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get('input');

  console.log('=== PLACES API CALLED ===');
  console.log('Input:', input);
  console.log('Search params:', Object.fromEntries(searchParams.entries()));

  if (!input) {
    console.log('No input provided');
    return NextResponse.json({ error: 'Input parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  console.log('Environment variables debug:');
  console.log('- GOOGLE_MAPS_API_KEY exists:', !!apiKey);
  console.log('- GOOGLE_MAPS_API_KEY length:', apiKey?.length);
  console.log('- GOOGLE_MAPS_API_KEY value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
  console.log('- All env vars with GOOGLE:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
  console.log('- All env vars with API:', Object.keys(process.env).filter(key => key.includes('API')));
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  
  if (!apiKey) {
    console.log('Google Maps API key not configured, using mock data');
    // Return mock data for testing when API key is not configured
    const mockSuggestions = getMockSuggestions(input);
    return NextResponse.json({ suggestions: mockSuggestions });
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