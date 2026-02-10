import { useState, useEffect, useRef } from "react";
import { User, Loader2, Pipette, Pause, HospitalIcon } from "lucide-react";
import { Card } from "@/components/ui/shadcn/card";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Button } from "@/components/ui/shadcn/button";
import { useDispatch, useSelector } from "react-redux";
import { initiateChat } from "../store/voicebotSlice";
import "regenerator-runtime/runtime";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ResultReason,
  CancellationReason,
} from "microsoft-cognitiveservices-speech-sdk";

// iOS Detection - Apple forces all browsers to use WebKit
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

export default function VoiceBot() {
  const [language, setLanguage] = useState("gu-IN");
  const [messages, setMessages] = useState([]);

  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);

  const dispatch = useDispatch();
  const { response, audioUrl, loading, error } = useSelector(
    (state) => state.voicebot,
  );

  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recognizerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const isUserStartedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Effect to handle new responses from Redux and speak them
  useEffect(() => {
    if (!loading && response) {
      const lastMessage = messages[messages.length - 1];

      const isWelcome = messages.length === 0;
      const followsUser = lastMessage?.type === "user";
      const isDuplicate =
        lastMessage?.type === "bot" && lastMessage.text === response;

      if ((isWelcome || followsUser) && !isDuplicate) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "bot",
            text: response,
            timestamp: new Date(),
          },
        ]);

        playAudioResponse(audioUrl, response);
      }
    }

    // Lock input during API loading
    if (loading) {
      shouldIgnoreInputRef.current = true;
    }
  }, [response, audioUrl, loading]);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Ref to track if we should ignore input (API loading OR Bot speaking)
  const shouldIgnoreInputRef = useRef(false);

  const playAudioResponse = (audioUrl, text) => {
    console.log("Speaking message:", text);
    setIsPlayingAudio(true);
    shouldIgnoreInputRef.current = true; // Gate input

    // Clear any lingering transcript from before audio started
    setTranscript("");

    if (!audioUrl) {
      console.error("No audio URL provided for response:", text);
      setIsPlayingAudio(false);
      shouldIgnoreInputRef.current = false;
      return;
    }

    const audio = playbackAudioRef.current;
    audio.src = audioUrl;

    // Define the handler so we can remove it later
    const handleEnded = () => {
      console.log("Speaker OFF - Audio playback ended");
      setIsPlayingAudio(false);

      // Small delay before re-enabling input to avoid picking up end of audio
      setTimeout(() => {
        shouldIgnoreInputRef.current = false;
        console.log("Input re-enabled - Ready for user speech");
      }, 300);

      // Remove listeners
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };

    const handleError = (e) => {
      console.error("Error playing audio:", e);
      console.log("Speaker OFF (Error)");
      setIsPlayingAudio(false);
      shouldIgnoreInputRef.current = false;
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };

    // Add listeners
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audio.play().catch((e) => {
      handleError(e);
    });
  };

  // Create a persistent Audio object for iOS compatibility
  const playbackAudioRef = useRef(new Audio());

  const handleLanguageSelect = async (selectedLang) => {
    // Unlock AudioContext for iOS immediately on user interaction
    const unlockAudio = () => {
      const audio = playbackAudioRef.current;
      audio.src =
        "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjYwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAADFMYXZjNTYuMAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAAD/84TTOHWWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OEz2ZMmMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg==";

      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch((e) => console.log("Audio unlock failed", e));
    };
    unlockAudio();

    setLanguage(selectedLang);
    setIsLanguageSelected(true);
    isConversationActive.current = true;
    isUserStartedRef.current = true;

    const shortLang = selectedLang.split("-")[0];

    // Start listening FIRST to secure the stream
    await startListening(selectedLang);

    // Then initiate chat (which might play welcome audio)
    dispatch(initiateChat({ start: true, language: shortLang }));
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // LOCK INPUT IMMEDIATELY
    shouldIgnoreInputRef.current = true;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        text: text,
        timestamp: new Date(),
      },
    ]);

    dispatch(initiateChat({ text }));
    setTranscript("");
  };

  const isConversationActive = useRef(false);

  const startListening = async (forceLanguage) => {
    // Clean up existing recognizer
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
      } catch (e) {
        console.warn("Error cleaning up old recognizer", e);
      }
      recognizerRef.current = null;
    }

    // Azure Configuration
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      console.error("Azure Speech credentials missing");
      setErrorMessage("Azure configuration missing. Please check .env file.");
      return;
    }

    const currentLang = forceLanguage || language;
    const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = currentLang;

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    // Event Handlers
    recognizer.recognizing = (s, e) => {
      // IGNORE input if bot is speaking OR loading
      if (shouldIgnoreInputRef.current) {
        console.log("🔇 Ignored input (Bot busy):", e.result.text);
        return;
      }
      console.log(`🎤 RECOGNIZING: ${e.result.text}`);
      setTranscript(e.result.text);
    };

    recognizer.recognized = (s, e) => {
      // IGNORE input if bot is speaking OR loading
      if (shouldIgnoreInputRef.current) {
        console.log("🔇 Ignored recognized (Bot busy):", e.result.text);
        return;
      }

      if (e.result.reason === ResultReason.RecognizedSpeech) {
        console.log(`✅ RECOGNIZED: ${e.result.text}`);
        if (e.result.text && e.result.text.trim()) {
          handleSendMessage(e.result.text);
          // Mic stays ON - we don't stop listening
        }
      } else if (e.result.reason === ResultReason.NoMatch) {
        console.log("❌ NOMATCH: Speech could not be recognized.");
        setTranscript("");
      }
    };

    recognizer.canceled = (s, e) => {
      console.log(`⚠️ CANCELED: Reason=${e.reason}`);
      if (e.reason === CancellationReason.Error) {
        console.log(`❌ CANCELED: ErrorCode=${e.errorCode}`);
        setErrorMessage("Speech recognition error. Please restart.");
      }
      setListening(false);
    };

    recognizer.sessionStarted = (s, e) => {
      console.log("🎙️ Session started - Mic is ON");
      setListening(true);
      setErrorMessage("");
      isUserStartedRef.current = true;
      isConversationActive.current = true;
    };

    recognizer.sessionStopped = (s, e) => {
      console.log("🛑 Session stopped - Mic is OFF");
      setListening(false);
    };

    // Start continuous recognition
    console.log("▶️ Starting Azure Speech Recognition...");
    recognizer.startContinuousRecognitionAsync(
      () => {
        console.log("✅ Recognition started successfully");
      },
      (err) => {
        console.error("❌ Failed to start recognition:", err);
        setErrorMessage("Failed to start microphone. Please try again.");
      },
    );
  };

  const stopListening = (disableConversation = true) => {
    console.log("🛑 Stopping microphone...");
    if (disableConversation) {
      isConversationActive.current = false;
    }

    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        setListening(false);
      });
    }

    // Also stop audio if playing
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    shouldIgnoreInputRef.current = false;
    setTranscript("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative">
      <Card className="w-full max-w-2xl h-[85vh] md:h-[800px] flex flex-col border-blue-600 overflow-hidden bg-white">
        {/* Header */}
        <div className="border-b border-slate-400 p-2 md:p-4 flex items-center justify-between bg-blue-600 z-10">
          <h1 className="text-md md:text-xl font-bold flex gap-2 text-white">
            Dr.Sapan Shah's AI Voice Bot
          </h1>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {listening && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">
                  {isPlayingAudio ? "Bot Speaking" : "Listening"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-1 md:p-2 space-y-6 scroll-smooth relative">
          {!isLanguageSelected ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <HospitalIcon size={50} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Welcome to Dr.Sapan Shah's AI Voicebot
                </h2>
                <p className="text-slate-500">
                  Please select your preferred language to start chatting.
                </p>
              </div>

              <div className="grid grid-cols-1 w-full max-w-xs gap-4">
                <Button
                  onClick={() => handleLanguageSelect("en-IN")}
                  variant="outline"
                  className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8 "
                >
                  English
                </Button>
                <Button
                  onClick={() => handleLanguageSelect("gu-IN")}
                  variant="outline"
                  className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8 "
                >
                  ગુજરાતી
                </Button>

                <Button
                  onClick={() => handleLanguageSelect("hi-IN")}
                  variant="outline"
                  className="h-full w-full m-auto text-lg font-medium hover:bg-green-100 hover:text-green-700 hover:border-green-200 transition-all justify-center px-8 "
                >
                  हिंदी
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-1 max-w-[85%] md:max-w-[75%] ${
                    msg.type === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 mt-1 border border-slate-200">
                    <AvatarFallback
                      className={`${
                        msg.type === "bot"
                          ? "bg-white text-blue-600"
                          : "bg-blue-600 text-white"
                      } text-xs shadow-sm`}
                    >
                      {msg.type === "bot" ? (
                        <HospitalIcon className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div
                      className={`border p-2 rounded-xl text-sm md:text-base ${
                        msg.type === "bot"
                          ? "bg-white border-slate-100 rounded-tl-sm text-slate-700"
                          : "bg-blue-600 border-blue-600 rounded-tr-sm text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="text-[10px] text-slate-400 px-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 max-w-[85%]">
                  <Avatar className="h-8 w-8 mt-1 border justify-center items-center border-slate-200">
                    <HospitalIcon className="h-4 w-4 text-blue-600" />
                  </Avatar>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                </div>
              )}

              {/* Visualizer / Transcript Preview - Always show when listening and not during bot response */}
              {listening && !isPlayingAudio && !loading && (
                <div className="flex flex-col items-center py-4 gap-2">
                  <div className="text-sm text-slate-500 italic animate-pulse font-medium">
                    {transcript || "Listening..."}
                  </div>
                  <div className="flex items-center gap-1.5 h-8">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-blue-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]"
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bot speaking indicator */}
              {isPlayingAudio && (
                <div className="flex flex-col items-center py-4 gap-2">
                  <div className="text-sm text-blue-600 font-medium">
                    🔊 Bot is speaking...
                  </div>
                  <div className="text-xs text-slate-400">
                    (Microphone active, waiting for response to finish)
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer Controls */}
        {isLanguageSelected && (
          <div className="py-2 border-t border-slate-400 flex items-center justify-center gap-8">
            {errorMessage && (
              <div className="absolute left-4 bottom-20 bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            <Button
              size="lg"
              onClick={() => {
                isConversationActive.current = true;
                startListening();
              }}
              disabled={listening || loading}
              className={`w-36 h-12 text-base text-white font-medium border-2 border-white transition-all ${
                listening
                  ? "opacity-50 cursor-not-allowed bg-green-600"
                  : "bg-green-600 hover:bg-white hover:text-green-600 hover:border hover:border-green-600 cursor-pointer"
              }`}
            >
              <Pipette className="mr-2 h-5 w-5" />
              {"Speak"}
            </Button>

            <Button
              size="lg"
              onClick={stopListening}
              disabled={!listening}
              className={`w-36 h-12 text-base font-medium border-2 border-white transition-all ${
                !listening
                  ? "opacity-50 cursor-not-allowed bg-red-600 text-white"
                  : "bg-red-600 text-white hover:bg-white hover:text-red-600 hover:border hover:border-red-600 cursor-pointer"
              }`}
            >
              <Pause className="mr-2 h-5 w-5 fill-current" /> Stop
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
