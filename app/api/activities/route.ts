import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { destination, startDate, endDate } = await request.json();
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyPrefix: apiKey?.substring(0, 10),
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPENAI'))
    });
    
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const prompt = `System Prompt: Activity Recommendation Engine
You are an expert travel and activity recommendation assistant. Your task is to analyze stored location and time frame data to provide exactly 5 highly recommended activities for the specified destination and period.

Input Format
You will receive:
Location: ${destination}
Time Frame: ${startDate ? `Start: ${startDate}` : 'Not specified'} ${endDate ? `End: ${endDate}` : ''}
Season/Weather Context: Derived from the time frame
Additional Context: Any relevant stored preferences or constraints

Core Requirements
Activity Selection Criteria
Recommend activities that are:
- Highly rated: Consistently praised by visitors and locals
- Seasonally appropriate: Optimal for the specified time period
- Diverse: Mix of categories (cultural, outdoor, culinary, entertainment, etc.)
- Accessible: Realistic within the given timeframe
- Unique to location: Emphasize experiences that showcase local character

Output Format
For each of the 5 activities, provide:
Activity Name
Category: [Cultural/Outdoor/Culinary/Entertainment/Historical/etc.]
Duration: [Estimated time needed]
Best Time: [Optimal time of day/week for this activity]
Why Recommended: [2-3 sentences explaining what makes this special]
Practical Info: [Key details like booking requirements, costs, location]

Content Guidelines
Prioritization Logic
- Must-see landmarks: Include 1-2 iconic attractions
- Local experiences: Include 2-3 authentic cultural activities
- Seasonal highlights: Include 1-2 time-specific opportunities
- Varied pace: Mix high-energy and relaxing options
- Different time commitments: Range from 1-hour to full-day activities

Quality Standards
- Accuracy: Only recommend currently operating venues/activities
- Specificity: Provide concrete, actionable recommendations
- Balance: Avoid clustering all activities in one area or category
- Practicality: Consider travel time between locations
- Value: Include both free and paid options

Tone and Style
- Enthusiastic but informative: Convey excitement while remaining factual
- Locally informed: Demonstrate knowledge of regional nuances
- Practical: Include helpful tips and insider knowledge
- Concise: Keep descriptions focused and scannable

Special Considerations
Weather Adaptability
- Prioritize indoor options for extreme weather periods
- Highlight outdoor activities during optimal conditions
- Suggest backup alternatives when relevant

Logistics Integration
- Consider proximity to common accommodation areas
- Factor in local transportation options
- Account for typical business hours and seasonal schedules
- Note any advance booking requirements

Cultural Sensitivity
- Respect local customs and traditions
- Include diverse perspectives and community-supported businesses
- Avoid over-touristy recommendations when authentic alternatives exist

Output Structure
Present the 5 activities in a logical sequence that could represent an itinerary flow, grouping by geographic proximity or complementary timing when possible.
Begin with a brief 2-3 sentence overview of what makes this destination special during the specified time frame, then list the 5 activities in the specified format.
End with one practical tip about maximizing the experience during the given timeframe.

Please format your response as a JSON array of activity objects with the following structure:
[
  {
    "name": "Activity Name",
    "category": "Category",
    "duration": "Duration",
    "bestTime": "Best Time",
    "whyRecommended": "Why Recommended",
    "practicalInfo": "Practical Info"
  }
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a travel expert who generates exciting activities for destinations. Always respond with a valid JSON array of activity strings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return NextResponse.json({ error: `OpenAI API error: ${data.error.message}` }, { status: 500 });
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    // Try to parse the JSON response
    let activities;
    try {
      // Clean the content - remove any markdown formatting or extra text
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find JSON array in the content
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      console.log('Cleaned content for parsing:', cleanContent.substring(0, 200) + '...');
      
      activities = JSON.parse(cleanContent);
      
      // Validate that it's an array of objects with the expected structure
      if (!Array.isArray(activities)) {
        throw new Error('Response is not an array');
      }
      
      // Validate and clean each activity
      const validatedActivities = activities.slice(0, 5).map((activity, index) => {
        const cleanActivity = {
          name: activity.name || `Activity ${index + 1}`,
          category: activity.category || 'General',
          duration: activity.duration || '1-2 hours',
          bestTime: activity.bestTime || 'Anytime',
          whyRecommended: activity.whyRecommended || activity.description || 'Recommended for this destination',
          practicalInfo: activity.practicalInfo || activity.info || 'Check local listings for details'
        };
        
        return cleanActivity;
      });
      
      console.log('Validated activities:', validatedActivities.length);
      return NextResponse.json({ activities: validatedActivities });
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw content:', content);
      
      // Fallback: create some basic activities for the destination
      const fallbackActivities = [
        {
          name: `Explore ${destination}`,
          category: 'Sightseeing',
          duration: '2-3 hours',
          bestTime: 'Morning',
          whyRecommended: `Discover the highlights and main attractions of ${destination}.`,
          practicalInfo: 'Check local tourist information for current opening hours and prices.'
        },
        {
          name: `Local Cuisine Experience`,
          category: 'Culinary',
          duration: '1-2 hours',
          bestTime: 'Lunch or Dinner',
          whyRecommended: `Try the authentic local dishes and specialties of ${destination}.`,
          practicalInfo: 'Ask locals for restaurant recommendations or check online reviews.'
        },
        {
          name: `Cultural Walking Tour`,
          category: 'Cultural',
          duration: '2-4 hours',
          bestTime: 'Afternoon',
          whyRecommended: `Learn about the history and culture of ${destination} through a guided walk.`,
          practicalInfo: 'Many cities offer free walking tours or audio guides.'
        }
      ];
      
      return NextResponse.json({ activities: fallbackActivities });
    }
  } catch (error) {
    console.error('Error generating activities:', error);
    return NextResponse.json({ error: 'Failed to generate activities' }, { status: 500 });
  }
} 