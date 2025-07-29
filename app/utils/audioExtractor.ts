// Client-side audio extraction from video files
export class AudioExtractor {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext only on user interaction to avoid browser restrictions
    this.initAudioContext = this.initAudioContext.bind(this);
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  async extractAudioFromVideo(videoFile: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create video element
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.crossOrigin = 'anonymous';
        video.muted = true; // Important to avoid autoplay restrictions
        
        video.onloadedmetadata = () => {
          const audioContext = this.initAudioContext();
          
          // Create MediaElementSource
          const source = audioContext.createMediaElementSource(video);
          
          // Create MediaRecorder to capture audio
          const stream = (canvas as any).captureStream ? (canvas as any).captureStream() : (canvas as any).mozCaptureStream();
          const dest = audioContext.createMediaStreamDestination();
          source.connect(dest);
          
          const mediaRecorder = new MediaRecorder(dest.stream, {
            mimeType: 'audio/webm; codecs=opus'
          });
          
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            resolve(audioBlob);
          };
          
          mediaRecorder.onerror = (error) => {
            reject(error);
          };
          
          // Start recording and play video
          mediaRecorder.start();
          video.play();
          
          video.onended = () => {
            mediaRecorder.stop();
          };
        };
        
        video.onerror = (error) => {
          reject(new Error('Failed to load video file'));
        };
        
        // Load the video file
        const videoURL = URL.createObjectURL(videoFile);
        video.src = videoURL;
        video.load();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Alternative simpler approach using just the video element
  async extractAudioSimple(videoFile: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      
      video.onloadeddata = async () => {
        try {
          const audioContext = this.initAudioContext();
          
          // Read the video file as array buffer
          const arrayBuffer = await videoFile.arrayBuffer();
          
          // For MP4 files, we can try to decode directly
          // This is a simplified approach - in production you'd want more robust parsing
          resolve(arrayBuffer);
          
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video'));
      };
      
      const videoURL = URL.createObjectURL(videoFile);
      video.src = videoURL;
      video.load();
    });
  }
}

// Utility function to convert audio blob to base64 for API transmission
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 data
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}