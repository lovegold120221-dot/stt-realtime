// Mock API service for demonstration
// In a real implementation, this would connect to a backend server

export interface TranscriptionRequest {
  audio: File;
  language?: string;
  stream?: boolean;
}

export interface TranscriptionResponse {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StreamTranscriptionData {
  type: 'transcription' | 'error' | 'status';
  text?: string;
  is_final?: boolean;
  confidence?: number;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Check API status
  async getStatus(): Promise<ApiResponse<{
    status: 'ready' | 'loading' | 'error';
    model: string;
    languages: string[];
    webgpu_supported: boolean;
  }>> {
    try {
      // Mock response - in real implementation, make actual API call
      const response = await fetch(`${this.baseUrl}/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch {
      // Mock data for demonstration
      return {
        success: true,
        data: {
          status: 'ready',
          model: 'Voxtral-Mini-4B',
          languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh', 'ar'],
          webgpu_supported: true,
        },
      };
    }
  }

  // Transcribe audio file
  async transcribeAudio(request: TranscriptionRequest): Promise<ApiResponse<TranscriptionResponse>> {
    const formData = new FormData();
    formData.append('audio', request.audio);
    
    if (request.language) {
      formData.append('language', request.language);
    }
    
    if (request.stream !== undefined) {
      formData.append('stream', request.stream.toString());
    }

    try {
      const response = await fetch(`${this.baseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch {
      // Mock response for demonstration
      return {
        success: true,
        data: {
          text: "This is a mock transcription result. In a real implementation, this would be the actual transcribed text from your audio file.",
          confidence: 0.95,
          language: request.language || 'en',
          duration: 2.5,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Create WebSocket connection for streaming transcription
  createStreamTranscription(): MockWebSocket {
    // In a real implementation, create actual WebSocket connection
    // For now, return a mock WebSocket
    const mockWebSocket = new MockWebSocket();
    return mockWebSocket;
  }
}

// Mock WebSocket implementation for demonstration
class MockWebSocket {
  private listeners: { [key: string]: ((event: { type: string; data?: string }) => void)[] } = {};
  private isOpen = false;

  addEventListener(event: string, callback: (event: { type: string; data?: string }) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Simulate connection opening
    if (event === 'open') {
      setTimeout(() => {
        this.isOpen = true;
        callback({ type: 'open' });
      }, 100);
    }
  }

  send(_data: ArrayBuffer | string) {
    if (!this.isOpen) {
      throw new Error('WebSocket is not connected');
    }

    // Simulate receiving transcription data
    if (this.listeners['message']) {
      setTimeout(() => {
        const mockData: StreamTranscriptionData = {
          type: 'transcription',
          text: 'Mock streaming transcription result...',
          is_final: Math.random() > 0.5,
          confidence: 0.85 + Math.random() * 0.15,
        };
        
        this.listeners['message'].forEach((callback) => {
          callback({ type: 'message', data: JSON.stringify(mockData) });
        });
      }, 50);
    }
  }

  close() {
    this.isOpen = false;
    if (this.listeners['close']) {
      this.listeners['close'].forEach((callback) => {
        callback({ type: 'close' });
      });
    }
  }

  get readyState() {
    return this.isOpen ? 1 : 0; // 1 = OPEN, 0 = CONNECTING
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for external use
export type { ApiService };
