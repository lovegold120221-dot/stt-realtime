import { createContext, useContext } from "react";

export type AppStatus = "idle" | "loading" | "ready" | "recording" | "error";

export interface VoxtralContextType {
  status: AppStatus;
  loadingProgress: number;
  loadingMessage: string;
  transcript: string;
  error: string | null;
  loadModel: () => void;
  resetSession: () => void;
  startRecording: () => void;
  stopRecording: () => void;
}

export const VoxtralContext = createContext<VoxtralContextType | undefined>(
  undefined,
);

export const useVoxtral = () => {
  const context = useContext(VoxtralContext);
  if (context === undefined) {
    throw new Error("useVoxtral must be used within a VoxtralProvider");
  }
  return context;
};
