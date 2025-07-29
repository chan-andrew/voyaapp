import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
  try {
    const { audioPath } = await request.json();

    if (!audioPath) {
      return NextResponse.json({ error: 'Audio path is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Create form data for OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', createReadStream(audioPath));
    formData.append('model', 'whisper-1');
    formData.append('language', 'en'); // Assuming English, but Whisper can auto-detect

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI Whisper API error:', data);
      return NextResponse.json({ 
        error: `Transcription failed: ${data.error?.message || 'Unknown error'}` 
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      transcription: data.text,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe audio' 
    }, { status: 500 });
  }
}