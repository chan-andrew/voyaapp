import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload endpoint hit');
    console.log('Content-Type:', request.headers.get('content-type'));
    
    const formData = await request.formData();
    console.log('FormData parsed successfully');
    
    const file = formData.get('video') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file found' }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      message: 'File received successfully'
    });
    
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({ 
      error: `Upload failed: ${error.message}` 
    }, { status: 500 });
  }
}