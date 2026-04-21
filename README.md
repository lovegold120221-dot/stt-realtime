# Eburon Realtime Transcription

Real-time speech transcription, entirely in your browser with WebGPU support.

## Features

- **Real-time Streaming**: Sub-500ms latency transcription
- **Private & Local**: All processing happens in your browser, no server required
- **Multi-language Support**: 13 languages supported with auto-detection
- **WebGPU Accelerated**: Optimized for modern browsers with WebGPU support
- **API Integration**: Comprehensive REST API and WebSocket endpoints for integration

## Quick Start

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `http://localhost:5173` in your browser

## API Documentation

Visit `/documentation` for comprehensive API documentation including:

- **File Transcription**: `POST /api/transcribe`
- **Service Status**: `GET /api/status`
- **Real-time Streaming**: `WebSocket /api/transcribe/stream`

## Supported Languages

English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Russian, Japanese, Korean, Chinese, Arabic

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **Transcription**: Transformers.js + WebGPU
- **Model**: Voxtral-Mini-4B-Realtime-2602-ONNX

## Browser Requirements

- Chrome/Edge 113+ with WebGPU support
- Firefox 113+ with WebGPU support
- Safari 16.4+ with WebGPU support

## Integration Examples

### JavaScript
```javascript
import { apiService } from './services/apiService';

const result = await apiService.transcribeAudio({
  audio: audioFile,
  language: 'en'
});
console.log(result.text);
```

### Python
```python
import requests

with open('audio.wav', 'rb') as f:
    response = requests.post(
        'http://localhost:5173/api/transcribe',
        files={'audio': f},
        data={'language': 'en'}
    )
    result = response.json()
    print(result['text'])
```

## License

MIT License - see LICENSE file for details
