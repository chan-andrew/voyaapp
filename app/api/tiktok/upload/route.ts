import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Configure the API route to handle large files
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout for processing

export async function POST(request: NextRequest) {
  console.log('=== TikTok Upload API Route Started ===');
  
  try {
    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ error: 'No video file uploaded' }, { status: 400 });
    }

    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads');
    const videoDir = path.join(uploadDir, 'videos');

    for (const dir of [uploadDir, videoDir]) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }

    // Save the video file temporarily
    const videoFileName = `${Date.now()}-${file.name}`;
    const videoPath = path.join(videoDir, videoFileName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(videoPath, buffer);

    console.log('Video saved to:', videoPath);

    // Process with OpenAI Whisper for transcription
    console.log('Starting OpenAI Whisper transcription...');
    
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('No OpenAI API key found');
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
      }

      // Create form data for OpenAI Whisper API using Web API FormData
      const whisperFormData = new globalThis.FormData();
      
      // Read the file as a blob
      const videoBlob = new Blob([buffer], { type: file.type || 'video/mp4' });
      whisperFormData.append('file', videoBlob, file.name);
      whisperFormData.append('model', 'whisper-1');
      whisperFormData.append('language', 'en');

      console.log('Sending video to OpenAI Whisper...');

      // Call OpenAI Whisper API with proper FormData
      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: whisperFormData,
      });

      if (!whisperResponse.ok) {
        const errorData = await whisperResponse.json();
        console.error('Whisper API error:', errorData);
        throw new Error(`Whisper API failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const transcriptionData = await whisperResponse.json();
      console.log('✅ Transcription successful:', transcriptionData.text);

      // Extract activity information from transcription using GPT
      console.log('Starting GPT activity extraction...');
      
      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are an expert travel activity analyzer. Given a TikTok video transcription, extract travel/activity information and format it as a structured activity recommendation.

Transcription: "${transcriptionData.text}"

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
}`
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        }),
      });

      if (!gptResponse.ok) {
        const errorData = await gptResponse.json();
        console.error('GPT API error:', errorData);
        throw new Error(`GPT API failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const gptData = await gptResponse.json();
      const content = gptData.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from GPT');
      }

      console.log('GPT raw response:', content);

      // Parse the JSON response
      let activity;
      try {
        // Clean the content and parse JSON
        let cleanContent = content.trim();
        
        // Remove markdown code blocks if present
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        activity = JSON.parse(cleanContent);
        console.log('✅ Activity extracted:', activity);

      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Raw content:', content);
        
        // Fallback activity
        activity = {
          name: 'TikTok Activity',
          location: 'Unknown Location',
          description: `Activity from TikTok: ${transcriptionData.text.substring(0, 100)}...`,
          category: 'General'
        };
      }

      // Create the final TikTok activity object
      const tiktokActivity = {
        id: Date.now().toString(),
        name: activity.name || 'Unknown Activity',
        location: activity.location || 'Unknown Location',
        description: activity.description || 'Activity extracted from TikTok video',
        category: activity.category || 'General',
        transcription: transcriptionData.text,
        videoPath: videoPath,
        createdAt: new Date().toISOString(),
      };

      console.log('✅ Final activity created:', tiktokActivity);

      return NextResponse.json({ 
        success: true, 
        activity: tiktokActivity,
        message: 'TikTok video processed successfully'
      });

    } catch (processingError) {
      console.error('❌ Processing error:', processingError);
      
      // Return a fallback activity with the error info
      const fallbackActivity = {
        id: Date.now().toString(),
        name: `Activity from ${file.name}`,
        location: 'Processing Error',
        description: `Failed to process video: ${processingError.message}`,
        category: 'Error',
        transcription: 'Transcription failed',
        videoPath: videoPath,
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ 
        success: true, 
        activity: fallbackActivity,
        message: `Processing failed: ${processingError.message}`
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process video upload' 
    }, { status: 500 });
  }
}