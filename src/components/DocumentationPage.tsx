import { useState } from "react";
import { Link } from "react-router-dom";
import { THEME } from "../constants";
import { AppGridBackground, useMountedTransition } from "./SharedUI";

const API_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/transcribe",
    description: "Transcribe audio data in real-time",
    parameters: [
      {
        name: "audio",
        type: "FormData",
        required: true,
        description: "Audio file (WAV, MP3, M4A, WebM)",
      },
      {
        name: "language",
        type: "string",
        required: false,
        description: "Language code (e.g., 'en', 'es', 'fr'). Auto-detected if not provided.",
      },
      {
        name: "stream",
        type: "boolean",
        required: false,
        description: "Enable streaming transcription (default: true)",
      },
    ],
    response: {
      type: "JSON",
      example: {
        text: "Hello, this is a transcription example.",
        confidence: 0.95,
        language: "en",
        duration: 2.5,
      },
    },
  },
  {
    method: "GET",
    path: "/api/status",
    description: "Check API service status and model availability",
    parameters: [],
    response: {
      type: "JSON",
      example: {
        status: "ready",
        model: "Voxtral-Mini-4B",
        languages: ["en", "es", "fr", "de", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh", "ar"],
        webgpu_supported: true,
      },
    },
  },
  {
    method: "WebSocket",
    path: "/api/transcribe/stream",
    description: "Real-time streaming transcription via WebSocket",
    parameters: [
      {
        name: "audio_chunk",
        type: "binary",
        required: true,
        description: "Audio data chunks sent as binary messages",
      },
    ],
    response: {
      type: "JSON",
      example: {
        type: "transcription",
        text: "Partial transcription result...",
        is_final: false,
        confidence: 0.87,
      },
    },
  },
];

const CODE_EXAMPLES = [
  {
    language: "JavaScript",
    code: `// Simple transcription request
const transcribeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('language', 'en');
  
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Transcription:', result.text);
    return result;
  } catch (error) {
    console.error('Transcription failed:', error);
  }
};

// Usage
const fileInput = document.getElementById('audio-file');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    transcribeAudio(file);
  }
});`,
  },
  {
    language: "Python",
    code: `import requests

def transcribe_audio(file_path, language='en'):
    """Transcribe audio file using Eburon Realtime API"""
    
    with open(file_path, 'rb') as audio_file:
        files = {'audio': audio_file}
        data = {'language': language}
        
        try:
            response = requests.post(
                'http://localhost:5173/api/transcribe',
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"Transcription: {result['text']}")
                print(f"Confidence: {result['confidence']}")
                return result
            else:
                print(f"Error: {response.status_code}")
                
        except Exception as e:
            print(f"Request failed: {e}")

# Usage
transcribe_audio('audio.wav', 'en')`,
  },
  {
    language: "WebSocket",
    code: `// Real-time streaming transcription
const ws = new WebSocket('ws://localhost:5173/api/transcribe/stream');

ws.onopen = () => {
  console.log('Connected to transcription service');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'transcription') {
    console.log('Transcription:', data.text);
    if (data.is_final) {
      console.log('Final result:', data.text);
    }
  }
};

// Send audio chunks (example using MediaRecorder)
const mediaRecorder = new MediaRecorder(stream);
mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    ws.send(event.data);
  }
};

mediaRecorder.start(100); // Send chunks every 100ms`,
  },
];

export const DocumentationPage = () => {
  const [activeTab, setActiveTab] = useState("endpoints");
  const mounted = useMountedTransition();

  return (
    <AppGridBackground
      className="min-h-screen p-6 overflow-y-auto"
      style={{ color: THEME.textBlack }}
    >
      <div
        className={`max-w-6xl mx-auto backdrop-blur-sm p-8 md:p-12 rounded-sm border shadow-2xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{
          backgroundColor: `${THEME.beigeLight}F2`,
          borderColor: THEME.beigeDark,
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to App
          </Link>
          
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tighter mb-4"
            style={{ color: THEME.textBlack }}
          >
            API Documentation
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl">
            Integrate Eburon Realtime Transcription into your applications with our REST API and WebSocket endpoints.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-lg" style={{ backgroundColor: `${THEME.beigeDark}20` }}>
          {["endpoints", "examples", "sdk"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md font-medium text-sm capitalize transition-all ${
                activeTab === tab
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              style={{
                backgroundColor: activeTab === tab ? THEME.mistralOrange : "transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === "endpoints" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
              {API_ENDPOINTS.map((endpoint, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-6 space-y-4"
                  style={{ borderColor: THEME.beigeDark }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="px-2 py-1 text-xs font-bold text-white rounded"
                          style={{ backgroundColor: THEME.mistralOrange }}
                        >
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-lg">{endpoint.path}</code>
                      </div>
                      <p className="text-gray-600">{endpoint.description}</p>
                    </div>
                  </div>

                  {endpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Parameters:</h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-start gap-3 text-sm">
                            <code className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {param.name}
                            </code>
                            <span className="text-gray-500">({param.type})</span>
                            <span className="text-red-500">{param.required && "*"}</span>
                            <span className="text-gray-600">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Response Example:</h4>
                    <pre
                      className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"
                    >
                      {JSON.stringify(endpoint.response.example, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "examples" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
              {CODE_EXAMPLES.map((example, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden"
                  style={{ borderColor: THEME.beigeDark }}
                >
                  <div
                    className="px-4 py-3 font-mono text-sm font-semibold text-white"
                    style={{ backgroundColor: THEME.mistralOrange }}
                  >
                    {example.language}
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm">
                    <code>{example.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}

          {activeTab === "sdk" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">SDK & Libraries</h2>
              
              <div className="border rounded-lg p-6" style={{ borderColor: THEME.beigeDark }}>
                <h3 className="text-lg font-semibold mb-3">JavaScript/TypeScript SDK</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Installation:</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <code>npm install @eburon/realtime-transcription</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Basic Usage:</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                      <code>{`import { EburonTranscription } from '@eburon/realtime-transcription';

const transcription = new EburonTranscription({
  apiUrl: 'http://localhost:5173/api',
  language: 'en'
});

// Transcribe audio file
const result = await transcription.transcribe(audioFile);
console.log(result.text);

// Start real-time transcription
const stream = transcription.createStream();
stream.on('transcription', (text) => {
  console.log('Live:', text);
});
stream.start();`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6" style={{ borderColor: THEME.beigeDark }}>
                <h3 className="text-lg font-semibold mb-3">Python SDK</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Installation:</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <code>pip install eburon-transcription</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Basic Usage:</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                      <code>{`from eburon_transcription import EburonClient

client = EburonClient(api_url='http://localhost:5173/api')

# Transcribe audio file
result = client.transcribe_file('audio.wav')
print(f"Transcription: {result.text}")

# Real-time transcription
for transcription in client.transcribe_stream():
    print(f"Live: {transcription.text}")`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: THEME.beigeDark }}>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Need help? Contact our support team or check out our GitHub repository.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="#"
                className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: THEME.mistralOrange }}
              >
                GitHub Repository
              </a>
              <a
                href="#"
                className="px-4 py-2 rounded-lg font-medium border transition-all hover:shadow-lg"
                style={{ borderColor: THEME.beigeDark, backgroundColor: `${THEME.beigeLight}` }}
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppGridBackground>
  );
};
