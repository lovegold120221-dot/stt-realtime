import { useVoxtral } from "./VoxtralContext";
import { THEME } from "../constants";
import {
  AppGridBackground,
  ErrorMessageBox,
  MicrophoneIcon,
  VoiceMeter,
} from "./SharedUI";

export const RunningPage = () => {
  const {
    status,
    transcript,
    startRecording,
    stopRecording,
    resetSession,
    error,
  } = useVoxtral();
  const isRecording = status === "recording";
  const transcriptText = transcript.trimStart();
  const hasTranscript = transcriptText.length > 0;

  const statusConfig = error
    ? {
        bg: `${THEME.errorRed}0D`,
        border: THEME.errorRed,
        dot: THEME.errorRed,
        label: "SYSTEM ERROR",
      }
    : isRecording
      ? {
          bg: `${THEME.mistralOrange}0D`,
          border: THEME.mistralOrange,
          dot: THEME.mistralOrange,
          label: "LIVE TRANSCRIPTION",
        }
      : {
          bg: "transparent",
          border: THEME.beigeDark,
          dot: "#9CA3AF",
          label: "STANDBY",
        };

  const controlLabel = isRecording ? "Stop" : "Start";
  const helperText = error
    ? "Resolve the error and start again."
    : isRecording
      ? "Listening live. Tap stop when you're done."
      : "Tap the microphone to begin.";

  return (
    <AppGridBackground
      className="min-h-screen flex items-center justify-center px-4 py-4 md:px-6 md:py-6"
      style={{ color: THEME.textBlack }}
    >
      <div
        className="w-full max-w-4xl rounded-[2rem] border bg-white/84 p-4 shadow-2xl backdrop-blur-sm md:p-5"
        style={{ borderColor: error ? `${THEME.errorRed}55` : THEME.beigeDark }}
      >
        <section
          className="flex min-h-[min(78vh,720px)] flex-col overflow-hidden rounded-[1.6rem] border bg-white/90"
          style={{
            borderColor: error ? `${THEME.errorRed}55` : THEME.beigeDark,
          }}
        >
          <div
            className="flex min-h-[76px] items-center justify-between border-b px-5 py-4"
            style={{ borderColor: THEME.beigeDark }}
          >
            <div className="flex min-h-[40px] flex-col justify-center">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-gray-500">
                Eburon Realtime
              </p>
              <h1 className="mt-1 text-xl font-semibold leading-none tracking-tight md:text-2xl">
                Real-time transcription
              </h1>
            </div>

            <div
              className="flex h-8 items-center gap-2 rounded-full border px-3 py-1.5"
              style={{
                backgroundColor: statusConfig.bg,
                borderColor: `${statusConfig.border}4D`,
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                {isRecording && (
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ backgroundColor: statusConfig.dot }}
                  />
                )}
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: statusConfig.dot }}
                />
              </span>
              <span
                className="text-[10px] font-bold tracking-[0.2em]"
                style={{ color: statusConfig.dot }}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            {error && (
              <ErrorMessageBox
                className="mx-5 mt-5 rounded-2xl border px-4 py-3"
                message={error}
              />
            )}

            <div className="relative flex-1 overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(${THEME.black} 1px, transparent 1px), linear-gradient(90deg, ${THEME.black} 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              />

              <div
                className={`relative z-10 flex h-full flex-col px-5 py-5 md:px-6 md:py-6 ${isRecording ? "justify-start" : "justify-center"}`}
              >
                {!isRecording && !transcriptText ? (
                  <div className="mx-auto flex max-w-md flex-col items-center text-center">
                    <div className="relative">
                      <button
                        onClick={startRecording}
                        className="relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border-none outline-none transition-all duration-300 hover:-translate-y-1 active:scale-95 md:h-32 md:w-32"
                        style={{
                          background: `linear-gradient(135deg, ${THEME.mistralOrange}, ${THEME.mistralOrangeLight})`,
                          boxShadow: `0 22px 44px ${THEME.mistralOrange}30`,
                        }}
                        aria-label={controlLabel}
                      >
                        <span
                          className="absolute inset-0 rounded-full opacity-25"
                          style={{
                            boxShadow: `0 0 0 14px ${THEME.mistralOrange}20`,
                          }}
                        />
                        <MicrophoneIcon className="relative h-12 w-12 text-white" />
                      </button>
                    </div>

                    <div className="mt-8 space-y-3">
                      <p className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Start transcription
                      </p>
                      <p className="text-sm text-gray-500 md:text-base">
                        {helperText}
                      </p>
                    </div>

                    <div
                      className="mt-8 w-full rounded-2xl border px-4 py-4"
                      style={{
                        backgroundColor: `${THEME.beigeLight}CC`,
                        borderColor: THEME.beigeDark,
                      }}
                    >
                      <VoiceMeter color={THEME.beigeDark} />
                      <p className="mt-3 text-xs font-mono uppercase tracking-[0.18em] text-gray-500">
                        Ready when you are
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3 pb-4">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Transcript
                        </span>
                      </div>

                      <div
                        className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{
                          backgroundColor: `${THEME.beigeLight}`,
                          color: THEME.textBlack,
                        }}
                      >
                        {transcriptText ? "Live output" : "Waiting for speech"}
                      </div>
                    </div>

                    <div className="history-scroll flex-1 overflow-y-auto">
                      {transcriptText ? (
                        <p
                          className="max-w-none text-lg font-mono leading-relaxed break-words whitespace-pre-wrap md:text-[1.4rem]"
                          style={{ color: THEME.textBlack }}
                        >
                          <span className="mr-1">{transcriptText}</span>
                          {isRecording && (
                            <span
                              className="inline-block w-2.5 h-5 align-middle cursor-blink ml-1"
                              style={{ backgroundColor: THEME.mistralOrange }}
                            />
                          )}
                        </p>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-center opacity-70">
                          <VoiceMeter color={THEME.mistralOrange} active />
                          <div className="space-y-1">
                            <p className="text-sm font-mono italic text-gray-500">
                              Listening for speech...
                            </p>
                            <p className="text-xs font-mono uppercase tracking-[0.18em] text-gray-400">
                              Local processing · realtime stream
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {(isRecording || hasTranscript) && (
              <div className="flex justify-center gap-3 px-5 pb-5 pt-2">
                {!isRecording && hasTranscript && (
                  <button
                    onClick={resetSession}
                    className="rounded-full border px-4 py-2 text-sm font-semibold text-gray-600 transition-all duration-300 hover:-translate-y-0.5 hover:text-black active:scale-95"
                    style={{
                      borderColor: THEME.beigeDark,
                      backgroundColor: `${THEME.beigeLight}`,
                    }}
                  >
                    Reset
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="group inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${THEME.mistralOrangeDark}, ${THEME.mistralOrange})`,
                      boxShadow: `0 12px 28px ${THEME.mistralOrange}30`,
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/18">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </span>
                    Stop
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between border-t bg-white/70 px-5 py-3 text-[10px] font-mono text-gray-400"
            style={{ borderColor: THEME.beigeDark }}
          >
            <span>{isRecording ? "stream: live" : "stream: ready"}</span>
            <span>{isRecording ? "mic: active" : "mic: idle"}</span>
          </div>
        </section>
      </div>
    </AppGridBackground>
  );
};
