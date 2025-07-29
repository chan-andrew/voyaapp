'use server'

export async function testUpload(formData: FormData) {
  try {
    console.log('=== Test Upload Server Action ===');
    
    const file = formData.get('video') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      };
    }
    
    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Just return success without processing
    return {
      success: true,
      activity: {
        id: Date.now().toString(),
        name: 'Test Activity',
        location: 'Test Location',
        description: 'Test description from server action',
        category: 'Test',
        transcription: 'Test transcription',
        videoPath: '/test/path',
        createdAt: new Date().toISOString(),
      },
      message: 'Test upload successful'
    };

  } catch (error) {
    console.error('Test upload error:', error);
    return {
      success: false,
      error: `Test upload failed: ${error.message}`
    };
  }
}