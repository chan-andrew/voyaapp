'use server'

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import FormData from 'form-data';
import { createReadStream } from 'fs';

export async function uploadTikTokVideo(formData: FormData) {
  try {
    console.log('=== Server Action: TikTok Upload Started ===');
    
    const file = formData.get('video') as File;
    
    if (!file) {
      throw new Error('No video file provided');
    }
    
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

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

    console.log('✅ Video saved to:', videoPath);

    // Process with OpenAI Whisper
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create form data for OpenAI Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', createReadStream(videoPath));
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'en');

    console.log('🎤 Sending to OpenAI Whisper...');

    // Call OpenAI Whisper API directly with video file
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...whisperFormData.getHeaders(),
      },
      body: whisperFormData,
    });

    const transcriptionData = await whisperResponse.json();

    if (!whisperResponse.ok) {
      console.error('❌ OpenAI Whisper API error:', transcriptionData);
      throw new Error(transcriptionData.error?.message || 'Transcription failed');
    }

    console.log('✅ Transcription successful:', transcriptionData.text);

    // Extract activity information from transcription
    const activityResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const activityData = await activityResponse.json();

    if (!activityResponse.ok) {
      console.error('❌ Activity extraction failed:', activityData);
      throw new Error(activityData.error?.message || 'Activity extraction failed');
    }

    const content = activityData.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

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
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      
      // Fallback activity
      activity = {
        name: 'TikTok Activity',
        location: 'Unknown Location',
        description: `Activity from TikTok: ${transcriptionData.text.substring(0, 100)}...`,
        category: 'General'
      };
    }

    // Validate the parsed activity
    const validatedActivity = {
      name: activity.name || 'Unknown Activity',
      location: activity.location || 'Unknown Location',
      description: activity.description || 'Activity extracted from TikTok video',
      category: activity.category || 'General'
    };

    console.log('✅ Activity extraction successful:', validatedActivity);

    // Create the TikTok activity object
    const tiktokActivity = {
      id: Date.now().toString(),
      name: validatedActivity.name,
      location: validatedActivity.location,
      description: validatedActivity.description,
      category: validatedActivity.category,
      transcription: transcriptionData.text,
      videoPath: videoPath,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      activity: tiktokActivity,
      message: 'TikTok video processed successfully'
    };

  } catch (error) {
    console.error('❌ Server action error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process video'
    };
  }
}