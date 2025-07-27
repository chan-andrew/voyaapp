import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const prompt = `Generate 10 unique and exciting activities or things to do in ${destination}. 
    Each activity should be specific and interesting. Format the response as a JSON array of strings.
    Example: ["Visit the historic temples", "Try local street food", "Take a sunset cruise"]
    Make sure the activities are diverse and include cultural, adventure, food, and sightseeing options.`;

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
        max_tokens: 500
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
      activities = JSON.parse(content);
    } catch (error) {
      // If parsing fails, try to extract activities from the text
      const activityMatches = content.match(/"([^"]+)"/g);
      if (activityMatches) {
        activities = activityMatches.map((match: string) => match.replace(/"/g, ''));
      } else {
        // Fallback: split by lines and clean up
        activities = content
          .split('\n')
          .filter((line: string) => line.trim() && !line.includes('[') && !line.includes(']'))
          .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^["\s-]+|["\s-]+$/g, ''))
          .filter((line: string) => line.length > 0)
          .slice(0, 10);
      }
    }

    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json({ error: 'Failed to parse activities' }, { status: 500 });
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error generating activities:', error);
    return NextResponse.json({ error: 'Failed to generate activities' }, { status: 500 });
  }
} 