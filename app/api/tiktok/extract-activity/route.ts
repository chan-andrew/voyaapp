import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const prompt = `You are an expert travel activity analyzer. Given a TikTok video transcription, extract travel/activity information and format it as a structured activity recommendation.

Transcription: "${transcription}"

Analyze the transcription and extract:
1. Activity name (what they're doing/recommending)
2. Location (city, country, or specific place mentioned)
3. Brief description (2-3 sentences about the activity)
4. Category (e.g., Food, Adventure, Culture, Shopping, Nightlife, Nature, etc.)

If the transcription doesn't clearly mention a travel activity or location, try to infer from context. If it's completely unrelated to travel, mark it as "General" category and use "Unknown Location".

Please respond with a JSON object in this exact format:
{
  "name": "Activity Name",
  "location": "City, Country",
  "description": "Brief description of the activity",
  "category": "Category"
}`;

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
            content: 'You are a travel activity extraction expert. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return NextResponse.json({ 
        error: `Activity extraction failed: ${data.error?.message || 'Unknown error'}` 
      }, { status: response.status });
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    try {
      // Clean the content and parse JSON
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const activity = JSON.parse(cleanContent);

      // Validate the parsed activity
      const validatedActivity = {
        name: activity.name || 'Unknown Activity',
        location: activity.location || 'Unknown Location',
        description: activity.description || 'Activity extracted from TikTok video',
        category: activity.category || 'General'
      };

      return NextResponse.json({
        success: true,
        activity: validatedActivity,
      });

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content:', content);
      
      // Fallback activity
      const fallbackActivity = {
        name: 'TikTok Activity',
        location: 'Unknown Location',
        description: `Activity from TikTok: ${transcription.substring(0, 100)}...`,
        category: 'General'
      };

      return NextResponse.json({
        success: true,
        activity: fallbackActivity,
      });
    }

  } catch (error) {
    console.error('Activity extraction error:', error);
    return NextResponse.json({ 
      error: 'Failed to extract activity information' 
    }, { status: 500 });
  }
}