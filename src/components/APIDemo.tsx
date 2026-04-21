import { useState, useRef } from "react";
import { apiService, type TranscriptionResponse } from "../services/apiService";
import { THEME } from "../constants";

export const APIDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiService.transcribeAudio({
        audio: file,
        language: selectedLanguage,
        stream: false,
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || "Transcription failed");
      }
    } catch {
      setError("An error occurred during transcription");
    } finally {
      setIsLoading(false);
    }
  };

  const testWebSocket = () => {
    const ws = apiService.createStreamTranscription();
    
    ws.addEventListener('open', () => {
      console.log('WebSocket connection opened');
    });

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
    });

    // Simulate sending audio data
    setTimeout(() => {
      ws.send('mock audio data');
    }, 1000);
  };

  const testStatus = async () => {
    try {
      const response = await apiService.getStatus();
      if (response.success && response.data) {
        console.log('API Status:', response.data);
        alert(`API Status: ${response.data.status}\nModel: ${response.data.model}\nLanguages: ${response.data.languages.length}`);
      }
    } catch {
      setError("Failed to check API status");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold" style={{ color: THEME.textBlack }}>
          API Demo
        </h2>
        <p className="text-gray-600">
          Test the Eburon Realtime Transcription API endpoints
        </p>
      </div>

      {/* File Upload Section */}
      <div
        className="border rounded-lg p-6 space-y-4"
        style={{ borderColor: THEME.beigeDark }}
      >
        <h3 className="text-xl font-semibold mb-4">File Transcription</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-2 border rounded-md"
              style={{ borderColor: THEME.beigeDark }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Audio File:</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="w-full p-2 border rounded-md"
              style={{ borderColor: THEME.beigeDark }}
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full py-3 text-white font-medium rounded-lg transition-all disabled:opacity-50"
            style={{ backgroundColor: THEME.mistralOrange }}
          >
            {isLoading ? "Transcribing..." : "Transcribe Audio"}
          </button>
        </div>

        {error && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: `${THEME.errorRed}1A`,
              borderColor: THEME.errorRed,
            }}
          >
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: `${THEME.mistralOrange}1A`,
              borderColor: THEME.mistralOrange,
            }}
          >
            <h4 className="font-semibold mb-2">Transcription Result:</h4>
            <p className="mb-2">{result.text}</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
              <p>Language: {result.language}</p>
              <p>Duration: {result.duration.toFixed(1)}s</p>
              <p>Timestamp: {new Date(result.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* API Test Section */}
      <div
        className="border rounded-lg p-6 space-y-4"
        style={{ borderColor: THEME.beigeDark }}
      >
        <h3 className="text-xl font-semibold mb-4">API Tests</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testStatus}
            className="py-3 px-4 text-white font-medium rounded-lg transition-all"
            style={{ backgroundColor: THEME.mistralOrange }}
          >
            Test Status Endpoint
          </button>
          
          <button
            onClick={testWebSocket}
            className="py-3 px-4 text-white font-medium rounded-lg transition-all"
            style={{ backgroundColor: THEME.mistralOrange }}
          >
            Test WebSocket
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Check the browser console for API test results.</p>
        </div>
      </div>

      {/* Code Examples */}
      <div
        className="border rounded-lg p-6 space-y-4"
        style={{ borderColor: THEME.beigeDark }}
      >
        <h3 className="text-xl font-semibold mb-4">Quick Code Example</h3>
        
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`// Using the API service
import { apiService } from './services/apiService';

// Transcribe audio file
const result = await apiService.transcribeAudio({
  audio: audioFile,
  language: 'en'
});

console.log(result.text);

// Create WebSocket for streaming
const ws = apiService.createStreamTranscription();
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Transcription:', data.text);
});`}</code>
        </pre>
      </div>
    </div>
  );
};
