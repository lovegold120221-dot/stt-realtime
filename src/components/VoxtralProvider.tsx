import { useState, useRef, useCallback } from "react";
import {
  BaseStreamer,
  VoxtralRealtimeForConditionalGeneration,
  VoxtralRealtimeProcessor,
  type ProgressInfo,
} from "@huggingface/transformers";
import { VoxtralContext, type AppStatus } from "./VoxtralContext";

import type { ReactNode } from "react";

const MODEL_ID = "onnx-community/Voxtral-Mini-4B-Realtime-2602-ONNX";
const SAMPLE_RATE = 16000;
const MODEL_FILE_COUNT = 3;
const CAPTURE_PROCESSOR_NAME = "capture-processor";
const CAPTURE_WORKLET_SOURCE = `
  class CaptureProcessor extends AudioWorkletProcessor {
    process(inputs) {
      const input = inputs[0];
      if (input.length > 0 && input[0].length > 0) {
        this.port.postMessage(input[0]);
      }
      return true;
    }
  }
  registerProcessor("capture-processor", CaptureProcessor);
`;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const VoxtralProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Ready to load model");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const modelRef = useRef<any>(null);
  const processorRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioBufferRef = useRef<Float32Array>(new Float32Array(0));
  const isRecordingRef = useRef(false);
  const stopRequestedRef = useRef(false);

  const cleanupAudio = useCallback(() => {
    isRecordingRef.current = false;

    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }, []);

  const appendAudio = useCallback((newSamples: Float32Array) => {
    if (newSamples.length === 0) {
      return;
    }

    const previousSamples = audioBufferRef.current;
    const mergedSamples = new Float32Array(
      previousSamples.length + newSamples.length,
    );
    mergedSamples.set(previousSamples);
    mergedSamples.set(newSamples, previousSamples.length);
    audioBufferRef.current = mergedSamples;
  }, []);

  const loadModel = useCallback(async () => {
    if (status === "loading" || status === "ready") {
      return;
    }

    setStatus("loading");
    setLoadingProgress(0);
    setLoadingMessage("Preparing model download...");
    setError(null);

    try {
      const progressMap = new Map<string, number>();
      const progressCallback = (info: ProgressInfo) => {
        if (
          info.status !== "progress" ||
          !info.file.endsWith(".onnx_data") ||
          info.total === 0
        ) {
          return;
        }

        progressMap.set(info.file, info.loaded / info.total);

        const totalProgress = Array.from(progressMap.values()).reduce(
          (sum, value) => sum + value,
          0,
        );

        setLoadingMessage("Downloading model...");
        setLoadingProgress(
          Math.min((totalProgress / MODEL_FILE_COUNT) * 100, 100),
        );
      };

      const model =
        await VoxtralRealtimeForConditionalGeneration.from_pretrained(
          MODEL_ID,
          {
            dtype: {
              audio_encoder: "q4f16",
              embed_tokens: "q4f16",
              decoder_model_merged: "q4f16",
            },
            device: "webgpu",
            progress_callback: progressCallback,
          },
        );

      setLoadingMessage("Loading processor...");
      const processor =
        await VoxtralRealtimeProcessor.from_pretrained(MODEL_ID);

      modelRef.current = model;
      processorRef.current = processor;
      setLoadingProgress(100);
      setLoadingMessage("Model ready");
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load model:", error);
      setError(getErrorMessage(error, "Failed to load model"));
      setLoadingMessage("Initialization failed");
      setStatus("error");
    }
  }, [status]);

  const runTranscription = useCallback(
    async (model: any, processor: any) => {
      const runtimeProcessor = processor as any;
      const audio = () => audioBufferRef.current;
      const numSamplesFirst = runtimeProcessor.num_samples_first_audio_chunk;
      await waitUntil(
        () => audio().length >= numSamplesFirst || stopRequestedRef.current,
      );

      if (stopRequestedRef.current) {
        cleanupAudio();
        setStatus("ready");
        return;
      }

      const firstChunkInputs = await runtimeProcessor(
        audio().subarray(0, numSamplesFirst),
        { is_streaming: true, is_first_audio_chunk: true },
      );

      const featureExtractor = runtimeProcessor.feature_extractor;
      const { hop_length, n_fft } = featureExtractor.config;
      const winHalf = Math.floor(n_fft / 2);
      const samplesPerTok = runtimeProcessor.audio_length_per_tok * hop_length;

      async function* inputFeaturesGenerator() {
        yield firstChunkInputs.input_features;

        let melFrameIdx = runtimeProcessor.num_mel_frames_first_audio_chunk;
        let startIdx = melFrameIdx * hop_length - winHalf;

        while (!stopRequestedRef.current) {
          const endNeeded =
            startIdx + runtimeProcessor.num_samples_per_audio_chunk;

          await waitUntil(
            () => audio().length >= endNeeded || stopRequestedRef.current,
          );

          if (stopRequestedRef.current) break;

          const availableSamples = audio().length;
          let batchEndSample = endNeeded;
          while (batchEndSample + samplesPerTok <= availableSamples) {
            batchEndSample += samplesPerTok;
          }

          const chunkInputs = await runtimeProcessor(
            audio().slice(startIdx, batchEndSample),
            { is_streaming: true, is_first_audio_chunk: false },
          );

          yield chunkInputs.input_features;

          melFrameIdx += chunkInputs.input_features.dims[2];
          startIdx = melFrameIdx * hop_length - winHalf;
        }
      }

      const tokenizer = runtimeProcessor.tokenizer;
      const specialIds = new Set(tokenizer.all_special_ids.map(BigInt));
      let tokenCache: bigint[] = [];
      let printLen = 0;
      let isPrompt = true;

      const flushDecodedText = () => {
        if (tokenCache.length === 0) {
          return;
        }

        const text = tokenizer.decode(tokenCache, {
          skip_special_tokens: true,
        });
        const printableText = text.slice(printLen);
        printLen = text.length;

        if (printableText.length > 0) {
          setTranscript((prev) => prev + printableText);
        }
      };

      const streamer = new (class extends BaseStreamer {
        put(value: bigint[][]) {
          if (stopRequestedRef.current) {
            return;
          }

          if (isPrompt) {
            isPrompt = false;
            return;
          }

          const tokens = value[0];

          if (tokens.length === 1 && specialIds.has(tokens[0])) {
            return;
          }

          tokenCache = tokenCache.concat(tokens);
          flushDecodedText();
        }

        end() {
          if (stopRequestedRef.current) {
            tokenCache = [];
            printLen = 0;
            isPrompt = true;
            return;
          }

          flushDecodedText();
          tokenCache = [];
          printLen = 0;
          isPrompt = true;
        }
      })();

      try {
        await (model as any).generate({
          input_ids: firstChunkInputs.input_ids,
          input_features: inputFeaturesGenerator(),
          max_new_tokens: 4096,
          streamer: streamer as any,
        });
      } catch (error) {
        if (!stopRequestedRef.current) {
          console.error("Transcription error:", error);
          setError(getErrorMessage(error, "Transcription failed"));
        }
      } finally {
        cleanupAudio();
        setStatus("ready");
      }
    },
    [cleanupAudio],
  );

  const startRecording = useCallback(async () => {
    const model = modelRef.current;
    const processor = processorRef.current;

    if (!model || !processor || isRecordingRef.current) {
      return;
    }

    setTranscript("");
    setError(null);
    audioBufferRef.current = new Float32Array(0);
    isRecordingRef.current = true;
    stopRequestedRef.current = false;
    setStatus("recording");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: SAMPLE_RATE,
        },
      });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;
      await audioContext.resume();

      const sourceNode = audioContext.createMediaStreamSource(stream);
      const silentGainNode = audioContext.createGain();
      silentGainNode.gain.value = 0;

      const workletBlob = new Blob([CAPTURE_WORKLET_SOURCE], {
        type: "application/javascript",
      });
      const workletUrl = URL.createObjectURL(workletBlob);
      await audioContext.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      const workletNode = new AudioWorkletNode(
        audioContext,
        CAPTURE_PROCESSOR_NAME,
      );
      workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (isRecordingRef.current) {
          appendAudio(new Float32Array(event.data));
        }
      };

      sourceNode.connect(workletNode);
      workletNode.connect(silentGainNode);
      silentGainNode.connect(audioContext.destination);
      workletNodeRef.current = workletNode;

      await runTranscription(model, processor);
    } catch (error) {
      console.error("Recording error:", error);
      setError(getErrorMessage(error, "Recording failed"));
      cleanupAudio();
      setStatus("ready");
    }
  }, [appendAudio, cleanupAudio, runTranscription]);

  const stopRecording = useCallback(() => {
    stopRequestedRef.current = true;
    isRecordingRef.current = false;
    cleanupAudio();
  }, [cleanupAudio]);

  const resetSession = useCallback(() => {
    stopRequestedRef.current = false;
    audioBufferRef.current = new Float32Array(0);
    setTranscript("");
    setError(null);
    setStatus("ready");
  }, []);

  return (
    <VoxtralContext.Provider
      value={{
        status,
        loadingProgress,
        loadingMessage,
        transcript,
        error,
        loadModel,
        resetSession,
        startRecording,
        stopRecording,
      }}
    >
      {children}
    </VoxtralContext.Provider>
  );
};

function waitUntil(condition: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    if (condition()) return resolve();
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}
